"""
战役资源：每个剧本的 prompt.md 会作为 LangChain 的 system 消息注入。

见 `prompts/keeper.py` 的 `get_system_prompt()` → `ChatPromptTemplate` 的 `{system_prompt}` 占位符。
"""

from pathlib import Path

CAMPAIGNS_DIR = Path(__file__).resolve().parents[2] / "campaigns"

DEFAULT_CAMPAIGN_ID = "darkwater-lake"


def load_campaign_prompt(campaign_id: str) -> str:
    """读取守秘人手册全文，不经过 LangChain，纯文件 IO。"""
    path = CAMPAIGNS_DIR / campaign_id / "prompt.md"
    if not path.exists():
        raise FileNotFoundError(f"Campaign not found: {campaign_id}")
    return path.read_text(encoding="utf-8")


def list_campaigns() -> list[str]:
    if not CAMPAIGNS_DIR.is_dir():
        return []
    return [
        p.name
        for p in CAMPAIGNS_DIR.iterdir()
        if p.is_dir() and (p / "prompt.md").exists()
    ]
