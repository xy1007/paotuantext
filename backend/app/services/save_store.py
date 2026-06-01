import json
import re
from datetime import datetime, timezone
from pathlib import Path

from pydantic import BaseModel, Field

from app.services.campaign import list_campaigns

SAVES_ROOT = Path(__file__).resolve().parents[2] / "saves"
MAX_SAVE_BYTES = 2 * 1024 * 1024
VALID_SLOTS = frozenset({1, 2, 3})
UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.I,
)


class CharacterIn(BaseModel):
    name: str
    hp: int
    maxHp: int
    san: int
    maxSan: int
    attrs: dict[str, int] = Field(default_factory=dict)


class SceneIn(BaseModel):
    title: str
    description: str


class MessageIn(BaseModel):
    id: str
    role: str
    content: str
    suggestions: list[dict] | None = None
    chosenSuggestionId: str | None = None


class StatusTagIn(BaseModel):
    id: str
    label: str
    source: str = "story"
    note: str | None = None


class GameSavePayload(BaseModel):
    version: int = 2
    campaignId: str
    investigatorId: str
    phase: str = "playing"
    character: CharacterIn
    scene: SceneIn
    messages: list[MessageIn]
    savedAt: str | None = None
    statuses: list[StatusTagIn] = Field(default_factory=list)
    clues: list[str] = Field(default_factory=list)


class SaveSlotMeta(BaseModel):
    slot: int
    empty: bool = True
    campaignId: str | None = None
    campaignTitle: str | None = None
    characterName: str | None = None
    sceneTitle: str | None = None
    savedAt: str | None = None
    messageCount: int = 0


def validate_player_id(player_id: str) -> str:
    pid = player_id.strip()
    if not UUID_RE.match(pid):
        raise ValueError("Invalid X-Player-Id")
    return pid


def validate_slot(slot: int) -> int:
    if slot not in VALID_SLOTS:
        raise ValueError("Slot must be 1, 2, or 3")
    return slot


def _player_dir(player_id: str) -> Path:
    return SAVES_ROOT / player_id


def _slot_path(player_id: str, slot: int) -> Path:
    return _player_dir(player_id) / f"{slot}.json"


def _campaign_title(campaign_id: str) -> str:
    titles = {
        "darkwater-lake": "暗湖魅影",
        "jincheng-shadow": "锦城幽影·凤鸣九天",
    }
    return titles.get(campaign_id, campaign_id)


def _meta_from_payload(slot: int, payload: GameSavePayload) -> SaveSlotMeta:
    return SaveSlotMeta(
        slot=slot,
        empty=False,
        campaignId=payload.campaignId,
        campaignTitle=_campaign_title(payload.campaignId),
        characterName=payload.character.name,
        sceneTitle=payload.scene.title,
        savedAt=payload.savedAt,
        messageCount=len(payload.messages),
    )


def list_slots(player_id: str) -> list[SaveSlotMeta]:
    pid = validate_player_id(player_id)
    result: list[SaveSlotMeta] = []
    for slot in sorted(VALID_SLOTS):
        path = _slot_path(pid, slot)
        if not path.exists():
            result.append(SaveSlotMeta(slot=slot, empty=True))
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            payload = GameSavePayload.model_validate(data)
            result.append(_meta_from_payload(slot, payload))
        except (json.JSONDecodeError, ValueError):
            result.append(
                SaveSlotMeta(slot=slot, empty=True, sceneTitle="存档损坏")
            )
    return result


def load_slot(player_id: str, slot: int) -> GameSavePayload:
    pid = validate_player_id(player_id)
    s = validate_slot(slot)
    path = _slot_path(pid, s)
    if not path.exists():
        raise FileNotFoundError("Save slot empty")
    return GameSavePayload.model_validate(
        json.loads(path.read_text(encoding="utf-8"))
    )


def save_slot(player_id: str, slot: int, payload: GameSavePayload) -> SaveSlotMeta:
    pid = validate_player_id(player_id)
    s = validate_slot(slot)

    if payload.campaignId not in list_campaigns():
        raise ValueError(f"Unknown campaign: {payload.campaignId}")

    if payload.phase != "playing":
        raise ValueError("Only playing phase can be saved")

    payload.savedAt = datetime.now(timezone.utc).isoformat()
    raw = payload.model_dump()
    encoded = json.dumps(raw, ensure_ascii=False)
    if len(encoded.encode("utf-8")) > MAX_SAVE_BYTES:
        raise ValueError("Save too large (max 2MB)")

    player_path = _player_dir(pid)
    player_path.mkdir(parents=True, exist_ok=True)
    path = _slot_path(pid, s)
    path.write_text(encoded, encoding="utf-8")
    return _meta_from_payload(s, payload)


def delete_slot(player_id: str, slot: int) -> None:
    pid = validate_player_id(player_id)
    s = validate_slot(slot)
    path = _slot_path(pid, s)
    if path.exists():
        path.unlink()
