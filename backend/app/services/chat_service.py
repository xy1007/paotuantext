"""
聊天业务层：在 LangChain 链之上做配置校验，对路由暴露「按 token 流式产出」。

学习要点：
- 路由（FastAPI）不应直接写 LangChain 细节，便于以后换链、加记忆、加 Tool。
- 本层是「应用服务」与「chains/keeper_chain」之间的薄封装。
"""

from collections.abc import AsyncIterator

from app.chains.keeper_chain import astream_keeper
from app.config import settings


async def stream_chat(
    messages: list[dict],
    campaign_id: str | None = None,
) -> AsyncIterator[str]:
    """
    对外统一的流式聊天入口。

    若未配置 API Key，在调用链之前失败，避免无意义的模型请求。
    """
    if not settings.api_key_configured:
        raise RuntimeError("DEEPSEEK_API_KEY not configured")

    async for token in astream_keeper(messages, campaign_id=campaign_id):
        yield token
