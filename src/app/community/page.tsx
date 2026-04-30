"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { isLoggedIn, getUsername, logout } from "@/lib/auth"

type Category = "ALL" | "CROSSFIT" | "RUNNING" | "HYROX" | "BOX_INFO" | "EVENT" | "FREE"

interface Post {
  id : number
  category : string
  title : string
  viewCount : number
  likeCount : number
  commentCount : number
  username : string
  createdAt : string
}

interface PageResponse {
  content : Post[]
  totalPages : number
  number : number
}

const CATEGORIES : { label : string; value : Category }[] = [
  { label: "전체", value: "ALL" },
  { label: "크로스핏", value: "CROSSFIT" },
  { label: "러닝", value: "RUNNING" },
  { label: "하이록스", value: "HYROX" },
  { label: "박스 정보", value: "BOX_INFO" },
  { label: "대회·이벤트", value: "EVENT" },
  { label: "자유", value: "FREE" },
]

const CATEGORY_COLOR : Record<string, string> = {
  CROSSFIT: "#f97316",
  RUNNING: "#22c55e",
  HYROX: "#6366f1",
  BOX_INFO: "#0ea5e9",
  EVENT: "#ec4899",
  FREE: "#999",
}

function formatDate(str : string) {
  const d = new Date(str)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) {
    return "방금"
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}분 전`
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}시간 전`
  }
  return `${d.getMonth() + 1}.${d.getDate()}`
}

export default function CommunityPage() {
  const router = useRouter()
  const [category, setCategory] = useState<Category>("ALL")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLoggedIn(isLoggedIn())
    setUsername(getUsername())
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [category, page])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params : Record<string, any> = { page, size: 20, sort: "createdAt,desc" }
      if (category !== "ALL") {
        params.category = category
      }
      const { data } = await api.get<PageResponse>("/api/posts", { params })
      setData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (cat : Category) => {
    setCategory(cat)
    setPage(0)
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>GoF<span style={{ color: "#f97316" }}>G</span></div>
        <nav style={s.nav}>
          <a style={s.navItem} href="/community">커뮤니티</a>
        </nav>
        <div style={s.headerRight}>
          {mounted && loggedIn ? (
            <>
              <span style={s.username}>{username}</span>
              <button style={s.btnWrite} onClick={() => router.push("/community/write")}>글쓰기</button>
              <button style={s.btnLogout} onClick={logout}>로그아웃</button>
            </>
          ) : mounted ? (
            <button style={s.btnWrite} onClick={() => router.push("/login")}>로그인</button>
          ) : null}
        </div>
      </header>

      {/* Category Tab */}
      <div style={s.tabBar}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            style={{ ...s.tab, ...(category === c.value ? s.tabActive : {}) }}
            onClick={() => handleCategoryChange(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.container}>
        {loading ? (
          <div style={s.empty}>불러오는 중...</div>
        ) : data?.content.length === 0 ? (
          <div style={s.empty}>게시글이 없습니다.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: 48 }}>번호</th>
                <th style={{ ...s.th, width: 80 }}>카테고리</th>
                <th style={s.th}>제목</th>
                <th style={{ ...s.th, width: 80 }}>작성자</th>
                <th style={{ ...s.th, width: 56 }}>조회</th>
                <th style={{ ...s.th, width: 72 }}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map((post) => (
                <tr
                  key={post.id}
                  style={s.tr}
                  onClick={() => router.push(`/community/${post.id}`)}
                >
                  <td style={s.tdNum}>{post.id}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: CATEGORY_COLOR[post.category] + "22",
                      color: CATEGORY_COLOR[post.category],
                    }}>
                      {CATEGORIES.find(c => c.value === post.category)?.label ?? post.category}
                    </span>
                  </td>
                  <td style={s.tdTitle}>
                    {post.title}
                    {post.commentCount > 0 && (
                      <span style={s.commentCount}>[{post.commentCount}]</span>
                    )}
                  </td>
                  <td style={s.td}>{post.username}</td>
                  <td style={{ ...s.td, textAlign: "right" }}>{post.viewCount}</td>
                  <td style={{ ...s.td, textAlign: "right", color: "#bbb" }}>{formatDate(post.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div style={s.pagination}>
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button
                key={i}
                style={{ ...s.pageBtn, ...(page === i ? s.pageBtnActive : {}) }}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s : Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", fontSize: 14 },
  header: { background: "#111", height: 52, display: "flex", alignItems: "center", padding: "0 20px", gap: 24, position: "sticky", top: 0, zIndex: 100 },
  logo: { color: "#fff", fontSize: 18, fontWeight: 800 },
  nav: { display: "flex", gap: 8 },
  navItem: { color: "#aaa", textDecoration: "none", fontSize: 13, padding: "4px 10px" },
  headerRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 },
  username: { color: "#aaa", fontSize: 13 },
  btnWrite: { background: "#f97316", border: "none", color: "#fff", padding: "5px 14px", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  btnLogout: { background: "transparent", border: "1px solid #444", color: "#aaa", padding: "5px 14px", borderRadius: 4, fontSize: 12, cursor: "pointer" },
  tabBar: { background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 20px", display: "flex", gap: 0 },
  tab: { background: "none", border: "none", borderBottom: "2px solid transparent", padding: "11px 16px", fontSize: 13, color: "#666", cursor: "pointer", fontWeight: 500 },
  tabActive: { color: "#111", fontWeight: 700, borderBottom: "2px solid #f97316" },
  container: { maxWidth: 900, margin: "20px auto", padding: "0 16px" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", border: "1px solid #e5e5e5" },
  th: { padding: "10px 12px", textAlign: "left", fontSize: 11, color: "#999", fontWeight: 600, borderBottom: "1px solid #f0f0f0" },
  tr: { borderBottom: "1px solid #f7f7f7", cursor: "pointer" },
  td: { padding: "10px 12px", color: "#666", fontSize: 12 },
  tdNum: { padding: "10px 12px", color: "#bbb", fontSize: 12 },
  tdTitle: { padding: "10px 12px", color: "#222", fontSize: 13 },
  badge: { display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3 },
  commentCount: { color: "#f97316", fontSize: 12, marginLeft: 4 },
  empty: { textAlign: "center", padding: "60px 0", color: "#999" },
  pagination: { display: "flex", justifyContent: "center", gap: 4, marginTop: 16 },
  pageBtn: { width: 28, height: 28, border: "1px solid #e5e5e5", background: "#fff", borderRadius: 4, fontSize: 12, cursor: "pointer", color: "#666" },
  pageBtnActive: { background: "#f97316", color: "#fff", borderColor: "#f97316", fontWeight: 700 },
}