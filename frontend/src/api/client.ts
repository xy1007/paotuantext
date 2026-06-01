/**
 * API 请求基址：
 * - 默认 ''：走 Vite 开发代理 /api → 127.0.0.1:8000（需 npm run dev）
 * - 设置 VITE_API_BASE=http://127.0.0.1:8000 可直连后端（手机访问电脑 IP 时用 http://<电脑IP>:8000）
 */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '')
  }
  return ''
}

export function apiUrl(path: string): string {
  const base = getApiBase()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path)
  try {
    return await fetch(url, init)
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e)
    if (raw === 'Failed to fetch' || e instanceof TypeError) {
      const base = getApiBase()
      const hint = base
        ? `无法连接 ${base}，请确认 backend 已启动（start.ps1）且防火墙允许 8000 端口。`
        : '无法连接后端。请确认：① backend 已运行 .\\start.ps1；② 前端用 npm run dev 打开（不要直接打开 dist/index.html）。'
      throw new Error(hint)
    }
    throw e
  }
}
