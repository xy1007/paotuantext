"""
LangChain 入口：创建与大模型对话的客户端。

学习要点：
- `ChatOpenAI` 来自 `langchain-openai`，兼容 OpenAI API 格式；
  DeepSeek 也提供 `/v1/chat/completions`，因此只需改 `base_url` 和 `api_key`。
- `streaming=True` 表示支持流式输出，后续链上调用 `.astream()` 才能逐 token 返回。
"""

from functools import lru_cache

from langchain_openai import ChatOpenAI

from app.config import settings


@lru_cache
def get_llm() -> ChatOpenAI:
    """
    单例 LLM：整个进程复用同一客户端，避免重复建连。

    `ChatOpenAI` 本身实现了 LangChain 的 Runnable 接口，
    因此可以直接参与 LCEL 管道：`prompt | llm`。
    """
    return ChatOpenAI(
        model=settings.deepseek_model,
        api_key=settings.deepseek_api_key or None,
        # DeepSeek 根地址 + /v1，与 OpenAI SDK 路径一致
        base_url=f"{settings.deepseek_base_url.rstrip('/')}/v1",
        temperature=0.85,
        streaming=True,
        timeout=180,
        max_retries=2,
    )
