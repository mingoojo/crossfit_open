// src/components/Header.tsx

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isLoggedIn, getUsername, logout } from "@/lib/auth"
import styles from "./Header.module.css"

const COMMUNITY_CATEGORIES = [
  { label: "크로스핏", value: "CROSSFIT" },
  { label: "러닝", value: "RUNNING" },
  { label: "하이록스", value: "HYROX" },
  { label: "자유", value: "FREE" },
]

const NAV_ITEMS = [
  { label: "박스 정보", href: "/box-info" },
  { label: "대회·이벤트", href: "/event" },
]

export default function Header() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setLoggedIn(isLoggedIn())
    setUsername(getUsername())
  }, [])

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="/" className={styles.logo}>
          GoF<span>G</span>
        </a>

        <nav className={styles.nav}>
          {/* 커뮤니티 드롭다운 */}
          <div className={styles.navItem}>
            <a href="/community" className={styles.navLink}>커뮤니티 ▾</a>
            <div className={styles.dropdown}>
              {COMMUNITY_CATEGORIES.map((c) => (
                <a
                  key={c.value}
                  href={`/community?category=${c.value}`}
                  className={styles.dropdownLink}
                >
                  {c.label}
                </a>
              ))}
            </div>
          </div>

          {/* 박스 정보, 대회·이벤트 */}
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className={styles.navItem}>
              <a href={item.href} className={styles.navLink}>{item.label}</a>
            </div>
          ))}
        </nav>

        <div className={styles.headerRight}>
          {mounted && loggedIn ? (
            <>
              <span className={styles.navUser}>{username}</span>
              <button className={styles.btnWrite} onClick={() => router.push("/community/write")}>
                글쓰기
              </button>
              <button className={styles.btnLogout} onClick={logout}>
                로그아웃
              </button>
            </>
          ) : mounted ? (
            <>
              <button className={styles.btnLogin} onClick={() => router.push("/login")}>
                로그인
              </button>
              <button className={styles.btnWrite} onClick={() => router.push("/signup")}>
                회원가입
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}