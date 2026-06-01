"""
FastAPI 应用入口。

LangChain 相关逻辑不在此文件，阅读顺序见 README「LangChain 后端结构」：
  llm → adapters → prompts → chains → services/chat_service → routers/chat
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import chat, saves

app = FastAPI(title="AI跑团 API", version="0.1.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(saves.router)
