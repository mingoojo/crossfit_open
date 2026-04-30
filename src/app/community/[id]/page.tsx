"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import api from "@/lib/api"
import { isLoggedIn, getUsername } from "@/lib/auth"

interface Post {
  id : number
  category : string
  title : string
  content : string
  viewCount : number
  likeCount : number
  commentCount : number
  userId : number
  username : string
  createdAt : string
}

const CATEGORY_LABEL : Record<string, string> = {
  CROSSFIT: "크로스핏",
  RUNNING: "러닝",
  HYROX: "하이록스",
  BOX_INFO: "박스 정보",
  EVENT: "대회·이벤트",
  FREE: "자유",
}

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
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function PostDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLoggedIn(isLoggedIn())
    setUsername(getUsername())
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const { data } = await api.get<Post>(`/api/posts/${id}`)
      setPost(data)
    } catch (e) {
      alert("존재하지 않는 게시글입니다.")
      router.push("/community")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) {
      return
    }
    setDeleting(true)
    try {
      await api.delete(`/api/posts/${id}`)
      router.push("/community")
    } catch (e) {
      alert("삭제에 실패했습니다.")
    } finally {
      setDeleting(false)
    }
  }

  const isOwner = mounted && loggedIn && post?.username === username

  if (loading) {
    return <div style={s.loading}>불러오는 중...</div>
  }
  if (!post) {
    return null
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo} onClick={() => router.push("/community")}>
          GoF<span style={{ color: "#f97316" }}>G</span>
        </div>
        <div style={s.headerRight}>
          {mounted && loggedIn ? (
            <>
              <span style={s.headerUsername}>{username}</span>
              <button style={s.btnWrite} onClick={() => router.push("/community/write")}>글쓰기</button>
            </>
          ) : mounted ? (
            <button style={s.btnWrite} onClick={() => router.push("/login")}>로그인</button>
          ) : null}
        </div>
      </header>

      <div style={s.container}>
        {/* 뒤로가기 */}
        <button style={s.back} onClick={() => router.push("/community")}>
          ← 목록으로
        </button>

        {/* 게시글 */}
        <div style={s.card}>
          {/* 카테고리 뱃지 */}
          <span style={{
            ...s.badge,
            background: CATEGORY_COLOR[post.category] + "22",
            color: CATEGORY_COLOR[post.category],
          }}>
            {CATEGORY_LABEL[post.category] ?? post.category}
          </span>

          {/* 제목 */}
          <h1 style={s.title}>{post.title}</h1>

          {/* 메타 */}
          <div style={s.meta}>
            <span style={s.metaItem}>{post.username}</span>
            <span style={s.metaDot}>·</span>
            <span style={s.metaItem}>{formatDate(post.createdAt)}</span>
            <span style={s.metaDot}>·</span>
            <span style={s.metaItem}>조회 {post.viewCount}</span>
            <span style={s.metaDot}>·</span>
            <span style={s.metaItem}>좋아요 {post.likeCount}</span>
          </div>

          <div style={s.divider} />

          {/* 본문 */}
          <div style={s.content}>
            {post.content.split("\n").map((line, i) => (
              <p key={i} style={{ margin: "4px 0" }}>{line || <br />}</p>
            ))}
          </div>

          {/* 수정/삭제 */}
          {isOwner && (
            <div style={s.actions}>
              <button
                style={s.btnEdit}
                onClick={() => router.push(`/community/${id}/edit`)}
              >
                수정
              </button>
              <button
                style={s.btnDelete}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s : Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", fontSize: 14 },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#999" },
  header: { background: "#111", height: 52, display: "flex", alignItems: "center", padding: "0 20px", gap: 24, position: "sticky", top: 0, zIndex: 100 },
  logo: { color: "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer" },
  headerRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 },
  headerUsername: { color: "#aaa", fontSize: 13 },
  btnWrite: { background: "#f97316", border: "none", color: "#fff", padding: "5px 14px", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  container: { maxWidth: 720, margin: "24px auto", padding: "0 16px" },
  back: { background: "none", border: "none", fontSize: 13, color: "#666", cursor: "pointer", marginBottom: 16, padding: 0 },
  card: { background: "#fff", borderRadius: 8, padding: "28px 32px", border: "1px solid #e5e5e5" },
  badge: { display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 700, color: "#111", margin: "8px 0 12px" },
  meta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  metaItem: { fontSize: 13, color: "#999" },
  metaDot: { color: "#ddd", fontSize: 12 },
  divider: { borderTop: "1px solid #f0f0f0", margin: "20px 0" },
  content: { fontSize: 15, color: "#333", lineHeight: 1.8, minHeight: 200 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 32, paddingTop: 16, borderTop: "1px solid #f0f0f0" },
  btnEdit: { background: "none", border: "1px solid #e5e5e5", borderRadius: 6, padding: "7px 18px", fontSize: 13, cursor: "pointer", color: "#666" },
  btnDelete: { background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "7px 18px", fontSize: 13, cursor: "pointer", color: "#ef4444" },
}