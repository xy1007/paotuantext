"""
HTTP 层：把 LangChain 流式输出包装成 SSE（Server-Sent Events）给前端。

学习要点：
- LangChain 负责「怎么调模型」；FastAPI 负责「怎么把结果交给浏览器」。
- 前端 `fetch` + ReadableStream 解析 `data: {...}\n\n` 行，与 OpenAI 流式 API 类似。
- 数据流：POST /api/chat → stream_chat → astream_keeper → chain.astream → yield token
"""

import json
from typing import Literal

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import ENV_FILE_PATH, ENV_LOAD_HINT, settings
from app.services.campaign import DEFAULT_CAMPAIGN_ID, list_campaigns
from app.services.chat_service import stream_chat

router = APIRouter(prefix="/api", tags=["chat"])


class ChatMessageIn(BaseModel):
    """与前端 types/chat.ts 对齐的消息体（路由入参校验）。"""

    role: Literal["narrator", "dm", "player", "system", "dice"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessageIn]
    campaign_id: str = DEFAULT_CAMPAIGN_ID


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "paotuan-backend",
        "model": settings.deepseek_model,
        "api_key_configured": settings.api_key_configured,
        "saves_api": True,
        "env_file": str(ENV_FILE_PATH),
        "env_file_exists": ENV_FILE_PATH.exists(),
        "hint": ENV_LOAD_HINT if not settings.api_key_configured else "",
        "default_campaign": DEFAULT_CAMPAIGN_ID,
        "campaigns": list_campaigns(),
    }


@router.post("/chat")
async def chat(req: ChatRequest):
    if not settings.api_key_configured:
        raise HTTPException(
            status_code=503,
            detail="DEEPSEEK_API_KEY 未配置，请在 backend/.env 中设置",
        )

    messages = [m.model_dump() for m in req.messages]

    async def event_generator():
        """
        SSE 生成器：每收到 LangChain 的一个 token，就发一行 `data: {"content":"..."}`。
        结束时发 `data: [DONE]`，前端据此关闭流。
        """
        try:
            async for token in stream_chat(messages, campaign_id=req.campaign_id):
                payload = json.dumps({"content": token}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"
        except RuntimeError as e:
            payload = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"data: {payload}\n\n"
        except Exception as e:
            payload = json.dumps({"error": f"服务异常: {e}"}, ensure_ascii=False)
            yield f"data: {payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用 Nginx 缓冲，保证流式即时到达浏览器
        },
    )
