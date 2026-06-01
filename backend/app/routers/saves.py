from fastapi import APIRouter, Header, HTTPException

from app.services.save_store import (
    GameSavePayload,
    delete_slot,
    list_slots,
    load_slot,
    save_slot,
    validate_player_id,
    validate_slot,
)

router = APIRouter(prefix="/api/saves", tags=["saves"])


def _require_player_id(x_player_id: str | None) -> str:
    if not x_player_id:
        raise HTTPException(status_code=400, detail="缺少请求头 X-Player-Id")
    try:
        return validate_player_id(x_player_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("")
async def list_saves(x_player_id: str | None = Header(None, alias="X-Player-Id")):
    pid = _require_player_id(x_player_id)
    slots = list_slots(pid)
    return {"slots": [s.model_dump() for s in slots]}


@router.get("/{slot}")
async def get_save(
    slot: int,
    x_player_id: str | None = Header(None, alias="X-Player-Id"),
):
    pid = _require_player_id(x_player_id)
    try:
        validate_slot(slot)
        payload = load_slot(pid, slot)
        return payload.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="该槽位暂无存档") from None


@router.put("/{slot}")
async def put_save(
    slot: int,
    body: GameSavePayload,
    x_player_id: str | None = Header(None, alias="X-Player-Id"),
):
    pid = _require_player_id(x_player_id)
    try:
        validate_slot(slot)
        meta = save_slot(pid, slot, body)
        return meta.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/{slot}")
async def remove_save(
    slot: int,
    x_player_id: str | None = Header(None, alias="X-Player-Id"),
):
    pid = _require_player_id(x_player_id)
    try:
        validate_slot(slot)
        delete_slot(pid, slot)
        return {"ok": True}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
