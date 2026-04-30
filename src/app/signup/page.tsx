"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signup } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signup(form.username, form.email, form.password)
      router.push("/community")
    } catch (err : any) {
      setError(err.response?.data?.message ?? "회원가입에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const set = (key : string) => (e : React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>GoF<span style={{ color: "#f97316" }}>G</span></div>
        <p style={styles.sub}>크로스핏 · 러닝 · 하이록스 커뮤니티</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="닉네임 (2~30자)" value={form.username} onChange={set("username")} required />
          <input style={styles.input} type="email" placeholder="이메일" value={form.email} onChange={set("email")} required />
          <input style={styles.input} type="password" placeholder="비밀번호 (8자 이상)" value={form.password} onChange={set("password")} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p style={styles.footer}>
          이미 계정이 있으신가요?{" "}
          <a href="/login" style={styles.link}>로그인</a>
        </p>
      </div>
    </div>
  )
}

const styles : Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { background: "#fff", borderRadius: 12, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", textAlign: "center" },
  logo: { fontSize: 28, fontWeight: 800, color: "#111", marginBottom: 6 },
  sub: { fontSize: 13, color: "#999", marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { border: "1px solid #e5e5e5", borderRadius: 6, padding: "11px 14px", fontSize: 14, outline: "none", width: "100%" },
  btn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  error: { color: "#ef4444", fontSize: 13, textAlign: "left" },
  footer: { marginTop: 20, fontSize: 13, color: "#999" },
  link: { color: "#f97316", fontWeight: 600, textDecoration: "none" },
}