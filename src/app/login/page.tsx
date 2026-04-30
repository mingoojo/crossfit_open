"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { login } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      const redirect = searchParams.get("redirect")
      router.push(redirect ?? "/")
    } catch (err : any) {
      setError(err.response?.data?.message ?? "로그인에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>GoF<span style={{ color: "#f97316" }}>G</span></div>
        <p style={styles.sub}>크로스핏 · 러닝 · 하이록스 커뮤니티</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p style={styles.footer}>
          계정이 없으신가요?{" "}
          <a href="/signup" style={styles.link}>회원가입</a>
        </p>
      </div>
    </div>
  )
}

const styles : Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: 800,
    color: "#111",
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: "#999",
    marginBottom: 28,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    padding: "11px 14px",
    fontSize: 14,
    outline: "none",
    width: "100%",
  },
  btn: {
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    textAlign: "left",
  },
  footer: {
    marginTop: 20,
    fontSize: 13,
    color: "#999",
  },
  link: {
    color: "#f97316",
    fontWeight: 600,
    textDecoration: "none",
  },
}