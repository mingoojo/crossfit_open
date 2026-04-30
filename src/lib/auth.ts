import api from "./api"

interface AuthResponse {
  accessToken : string
  refreshToken : string
  userId : number
  username : string
}

export async function signup(username : string, email : string, password : string) {
  const { data } = await api.post<AuthResponse>("/api/auth/signup", { username, email, password })
  if (typeof window === "undefined") {
    return null
  }
  localStorage.setItem("accessToken", data.accessToken)
  localStorage.setItem("username", data.username)
  return data
}

export async function login(email : string, password : string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password })
  if (typeof window === "undefined") {
    return null
  }
  localStorage.setItem("accessToken", data.accessToken)
  localStorage.setItem("username", data.username)
  return data
}

export function logout() {
  if (typeof window === "undefined") {
    return null
  }
  localStorage.removeItem("accessToken")
  localStorage.removeItem("username")
  window.location.href = "/login"
}

export function getUsername() {
  if (typeof window === "undefined") {
    return null
  }
  return localStorage.getItem("username")
}

export function isLoggedIn() {
  if (typeof window === "undefined") {
    return false
  }
  return !!localStorage.getItem("accessToken")
}