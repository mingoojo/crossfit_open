// src/app/login/page.tsx

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { login } from "@/lib/auth"
import styles from "./login.module.css"

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
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          GoF<span>G</span>
        </div>
        <p className={styles.sub}>크로스핏 · 러닝 · 하이록스 커뮤니티</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className={styles.footer}>
          계정이 없으신가요?{" "}
          <a href="/signup" className={styles.link}>회원가입</a>
        </p>
      </div>
    </div>
  )
}