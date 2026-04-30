// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { isLoggedIn, getUsername, logout } from "@/lib/auth"

interface Post {
  id : number
  category : string
  title : string
  viewCount : number
  commentCount : number
  username : string
  createdAt : string
}

interface PageResponse {
  content : Post[]
  totalPages : number
  number : number
}

const BOARDS = [
  { label: "크로스핏", value: "CROSSFIT", color: "#f97316" },
  { label: "러닝", value: "RUNNING", color: "#22c55e" },
  { label: "하이록스", value: "HYROX", color: "#6366f1" },
  { label: "박스 정보", value: "BOX_INFO", color: "#0ea5e9" },
  { label: "대회·이벤트", value: "EVENT", color: "#ec4899" },
  { label: "자유", value: "FREE", color: "#999" },
]

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

function BoardSection({
  board,
  posts,
  onPostClick,
  onMoreClick,
} : {
  board : (typeof BOARDS)[0]
  posts : Post[]
  onPostClick : (id : number) => void
  onMoreClick : (cat : string) => void
}) {
  return (
    <div style={s.board}>
      <div style={s.boardHeader}>
        <span style={{ ...s.boardDot, background: board.color }} />
        <span style={s.boardTitle}>{board.label}</span>
        <button style={s.boardMore} onClick={() => onMoreClick(board.value)}>
          더보기 +
        </button>
      </div>
      <ul style={s.boardList}>
        {posts.length === 0 && (
          <li style={s.boardEmpty}>아직 글이 없어요</li>
        )}
        {posts.map((post) => (
          <li key={post.id} style={s.boardItem} onClick={() => onPostClick(post.id)}>
            <span style={s.boardItemTitle}>
              {post.title}
              {post.commentCount > 0 && (
                <span style={{ color: board.color, fontSize: 11, marginLeft: 4 }}>
                  [{post.commentCount}]
                </span>
              )}
            </span>
            <span style={s.boardItemMeta}>{formatDate(post.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MainPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [hotPosts, setHotPosts] = useState<Post[]>([])
  const [boardPosts, setBoardPosts] = useState<Record<string, Post[]>>({})
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  useEffect(() => {
    setMounted(true)
    setLoggedIn(isLoggedIn())
    setUsername(getUsername())
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      // 전체 최신글 (인기글 대용 — 조회수순)
      const [hotRes, recentRes, ...boardRes] = await Promise.all([
        api.get<PageResponse>("/api/posts", { params: { page: 0, size: 5, sort: "viewCount,desc" } }),
        api.get<PageResponse>("/api/posts", { params: { page: 0, size: 8, sort: "createdAt,desc" } }),
        ...BOARDS.map((b) =>
          api.get<PageResponse>("/api/posts", {
            params: { page: 0, size: 5, sort: "createdAt,desc", category: b.value },
          })
        ),
      ])

      setHotPosts(hotRes.data.content)
      setRecentPosts(recentRes.data.content)

      const map : Record<string, Post[]> = {}
      BOARDS.forEach((b, i) => {
        map[b.value] = boardRes[i].data.content
      })
      setBoardPosts(map)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <a href="/" style={s.logo}>
            GoF<span style={{ color: "#f97316" }}>G</span>
          </a>
          <nav style={s.nav}>
            {BOARDS.map((b) => (
              <a
                key={b.value}
                href={`/community?category=${b.value}`}
                style={s.navLink}
              >
                {b.label}
              </a>
            ))}
          </nav>
          <div style={s.headerRight}>
            {mounted && loggedIn ? (
              <>
                <span style={s.navUser}>{username}</span>
                <button style={s.btnWrite} onClick={() => router.push("/community/write")}>
                  글쓰기
                </button>
                <button style={s.btnLogout} onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : mounted ? (
              <>
                <button style={s.btnLogin} onClick={() => router.push("/login")}>
                  로그인
                </button>
                <button style={s.btnWrite} onClick={() => router.push("/signup")}>
                  회원가입
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Body */}
      <main style={s.main}>
        <div style={s.mainInner}>
          {/* Left: 게시판 그리드 */}
          <div style={s.left}>
            <div style={s.boardGrid}>
              {BOARDS.map((b) => (
                <BoardSection
                  key={b.value}
                  board={b}
                  posts={boardPosts[b.value] ?? []}
                  onPostClick={(id) => router.push(`/community/${id}`)}
                  onMoreClick={(cat) => router.push(`/community?category=${cat}`)}
                />
              ))}
            </div>
          </div>

          {/* Right: 사이드바 */}
          <aside style={s.aside}>
            {/* 실시간 인기 */}
            <div style={s.widget}>
              <div style={s.widgetHeader}>
                <span style={s.widgetDot} />
                🔥 실시간 인기글
              </div>
              <ul style={s.widgetList}>
                {hotPosts.length === 0 && (
                  <li style={s.boardEmpty}>아직 글이 없어요</li>
                )}
                {hotPosts.map((post, i) => (
                  <li
                    key={post.id}
                    style={s.widgetItem}
                    onClick={() => router.push(`/community/${post.id}`)}
                  >
                    <span style={s.widgetRank}>{i + 1}</span>
                    <span style={s.widgetTitle}>
                      {post.title}
                      {post.commentCount > 0 && (
                        <span style={{ color: "#f97316", fontSize: 10, marginLeft: 3 }}>
                          [{post.commentCount}]
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 최근 글 */}
            <div style={s.widget}>
              <div style={s.widgetHeader}>
                <span style={s.widgetDot} />
                📋 최근 글
              </div>
              <ul style={s.widgetList}>
                {recentPosts.length === 0 && (
                  <li style={s.boardEmpty}>아직 글이 없어요</li>
                )}
                {recentPosts.map((post) => (
                  <li
                    key={post.id}
                    style={s.widgetItem}
                    onClick={() => router.push(`/community/${post.id}`)}
                  >
                    <span style={s.widgetTitle}>{post.title}</span>
                    <span style={s.widgetDate}>{formatDate(post.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 바로가기 */}
            <div style={s.widget}>
              <div style={s.widgetHeader}>
                <span style={s.widgetDot} />
                📌 바로가기
              </div>
              <div style={s.shortcutGrid}>
                {BOARDS.map((b) => (
                  <button
                    key={b.value}
                    style={{ ...s.shortcut, borderColor: b.color, color: b.color }}
                    onClick={() => router.push(`/community?category=${b.value}`)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer style={s.footer}>
        <span style={s.footerLogo}>
          GoF<span style={{ color: "#f97316" }}>G</span>
        </span>
        <span style={s.footerText}>운동하는 사람들의 커뮤니티</span>
      </footer>
    </div>
  )
}

const s : Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f4f4",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 13,
    color: "#222",
    display: "flex",
    flexDirection: "column",
  },

  // Header
  header: {
    background: "#111",
    borderBottom: "2px solid #f97316",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 16px",
    height: 50,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: 900,
    textDecoration: "none",
    letterSpacing: -0.5,
    flexShrink: 0,
  },
  nav: { display: "flex", gap: 2, flex: 1 },
  navLink: {
    color: "#bbb",
    textDecoration: "none",
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 4,
    whiteSpace: "nowrap" as const,
  },
  headerRight: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  navUser: { color: "#aaa", fontSize: 12 },
  btnWrite: {
    background: "#f97316",
    border: "none",
    color: "#fff",
    padding: "5px 12px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnLogin: {
    background: "transparent",
    border: "1px solid #555",
    color: "#ccc",
    padding: "5px 12px",
    borderRadius: 4,
    fontSize: 11,
    cursor: "pointer",
  },
  btnLogout: {
    background: "transparent",
    border: "1px solid #444",
    color: "#888",
    padding: "5px 12px",
    borderRadius: 4,
    fontSize: 11,
    cursor: "pointer",
  },

  // Main layout
  main: { maxWidth: 1200, width: "100%", margin: "16px auto", padding: "0 16px", flex: 1 },
  mainInner: { display: "flex", gap: 16, alignItems: "flex-start" },

  // Left
  left: { flex: 1, minWidth: 0 },
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },

  // Board
  board: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    overflow: "hidden",
  },
  boardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  boardDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  boardTitle: { fontWeight: 700, fontSize: 13, flex: 1 },
  boardMore: {
    background: "none",
    border: "none",
    color: "#aaa",
    fontSize: 11,
    cursor: "pointer",
    padding: 0,
  },
  boardList: { listStyle: "none", margin: 0, padding: 0 },
  boardItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 14px",
    borderBottom: "1px solid #f7f7f7",
    cursor: "pointer",
    gap: 8,
  },
  boardItemTitle: {
    color: "#333",
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    flex: 1,
  },
  boardItemMeta: { color: "#bbb", fontSize: 11, flexShrink: 0 },
  boardEmpty: { padding: "14px", color: "#ccc", fontSize: 12, listStyle: "none" },

  // Aside
  aside: { width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 },
  widget: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    overflow: "hidden",
  },
  widgetHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
    fontWeight: 700,
    fontSize: 12,
    color: "#333",
  },
  widgetDot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#f97316",
  },
  widgetList: { listStyle: "none", margin: 0, padding: 0 },
  widgetItem: {
    display: "flex",
    alignItems: "center",
    padding: "7px 14px",
    borderBottom: "1px solid #f7f7f7",
    cursor: "pointer",
    gap: 8,
  },
  widgetRank: {
    color: "#f97316",
    fontWeight: 800,
    fontSize: 12,
    width: 14,
    flexShrink: 0,
  },
  widgetTitle: {
    color: "#333",
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    flex: 1,
  },
  widgetDate: { color: "#bbb", fontSize: 10, flexShrink: 0 },

  // Shortcuts
  shortcutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
    padding: 10,
  },
  shortcut: {
    background: "#fff",
    border: "1px solid",
    borderRadius: 4,
    padding: "6px 0",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },

  // Footer
  footer: {
    background: "#111",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },
  footerLogo: { color: "#fff", fontSize: 15, fontWeight: 800 },
  footerText: { color: "#555", fontSize: 11 },
}