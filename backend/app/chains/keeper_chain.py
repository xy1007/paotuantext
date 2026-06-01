"""
LCEL 链：Prompt 模板 + LLM，并对外提供异步流式接口。

学习要点（建议按此顺序阅读本仓库）：
  adapters/messages.py → prompts/keeper.py → 本文件 → services/chat_service.py

- **LCEL**（LangChain Expression Language）：用 `|` 把 Runnable 串起来，
  `keeper_prompt | get_llm()` 表示：先格式化 prompt，再把结果交给模型。
- 链的输入是 dict：`{"system_prompt": "...", "history": [HumanMessage, ...]}`。
- `.astream()` 逐块返回；块可能是 AIMessageChunk，需用 `_extract_text` 取出文本。
"""

from collections.abc import AsyncIterator

from langchain_core.messages import BaseMessage
from langchain_core.runnables import Runnable

from app.adapters.messages import to_langchain_messages
from app.llm.factory import get_llm
from app.prompts.keeper import get_system_prompt, keeper_prompt

# 进程内缓存整条链，避免每次请求重复 `prompt | llm` 的组装开销
_keeper_chain: Runnable | None = None


def get_keeper_chain() -> Runnable:
    """
    构建并缓存守秘人链。

    `Runnable` 是 LangChain 的统一抽象：Prompt、LLM、工具、解析器都可串联。
    此处链结构：ChatPromptTemplate → ChatOpenAI（流式）。
    """
    global _keeper_chain
    if _keeper_chain is None:
        _keeper_chain = keeper_prompt | get_llm()
    return _keeper_chain


def _extract_text(chunk) -> str:
    """
    从流式 chunk 中取出纯文本。

    不同模型/版本可能返回 str，或 content 为 list（多模态块）；
    这里做兼容，避免前端 SSE 收到非字符串结构。
    """
    content = chunk.content if hasattr(chunk, "content") else chunk
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "".join(parts)
    return str(content) if content else ""


async def astream_keeper(
    messages: list[dict],
    campaign_id: str | None = None,
) -> AsyncIterator[str]:
    """
    守秘人回复的异步生成器：每 yield 一段文本，供上层 SSE 推送给前端。

    调用链：
      前端 JSON messages
        → to_langchain_messages → history
        → get_system_prompt → system_prompt
        → chain.astream({...}) → 逐 token
    """
    history: list[BaseMessage] = to_langchain_messages(messages)
    system_prompt = get_system_prompt(campaign_id)
    chain = get_keeper_chain()

    # astream：异步流式；与 ainvoke（一次性）相对，适合聊天打字机效果
    async for chunk in chain.astream(
        {"system_prompt": system_prompt, "history": history},
    ):
        text = _extract_text(chunk)
        if text:
            yield text
