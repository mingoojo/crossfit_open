import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
})

// 요청 시 토큰 자동 주입
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 시 로그인 페이지로 (현재 경로를 redirect 파라미터로 넘김)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken")
      const current = window.location.pathname + window.location.search
      window.location.href = `/login?redirect=${encodeURIComponent(current)}`
    }
    return Promise.reject(err)
  }
)

export default api