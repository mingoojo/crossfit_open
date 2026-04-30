"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import api from "@/lib/api"
import { getUsername } from "@/lib/auth"

const CATEGORIES = [
  { label: "크로스핏", value: "CROSSFIT" },
  { label: "러닝", value: "RUNNING" },
  { label: "하이록스", value: "HYROX" },
  { label: "박스 정보", value: "BOX_INFO" },
  { label: "대회·이벤트", value: "EVENT" },
  { label: "자유", value: "FREE" },
]

interface Post {
  id : number
  category : string
  title : string
  content : string
  username : string
}

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [form, setForm] = useState({ category: "CROSSFIT", title: "", content: "" })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } : { data : Post } = await api.get(`/api/posts/${id}`)
        // 본인 글인지 확인
        const me = getUsername()

        console.log(data, me)

        if (data.username !== me) {
          alert("수정 권한이 없습니다.")
          router.replace(`/community/${id}`)
          return
        }
        setForm({
          category: data.category,
          title: data.title,
          content: data.content,
        })
      } catch {
        alert("글을 불러오는데 실패했습니다.")
        router.replace("/community")
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id, router])

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.put(`/api/posts/${id}`, form)
      router.push(`/community/${id}`)
    } catch (err : any) {
      setError(err.response?.data?.message ?? "수정에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.loading}>불러오는 중...</div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.back} onClick={() => router.back()}>← 뒤로</button>
          <h2 style={s.title}>글 수정</h2>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <select
            style={s.select}
            value={form.category}
            onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <input
            style={s.input}
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />

          <textarea
            style={s.textarea}
            placeholder="내용을 입력하세요"
            value={form.content}
            onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            required
          />

          {error && <p style={s.error}>{error}</p>}

          <div style={s.actions}>
            <button type="button" style={s.btnCancel} onClick={() => router.back()}>
              취소
            </button>
            <button type="submit" style={s.btnSubmit} disabled={submitting}>
              {submitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s : Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 80,
    color: "#999",
    fontSize: 14,
  },
  container: { maxWidth: 720, margin: "0 auto", padding: "24px 16px" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  back: {
    background: "none",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    color: "#666",
  },
  title: { fontSize: 18, fontWeight: 700, color: "#111" },
  form: {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    border: "1px solid #e5e5e5",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  select: {
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
  },
  input: {
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
  },
  textarea: {
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    minHeight: 300,
    resize: "vertical",
  },
  error: { color: "#ef4444", fontSize: 13 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 },
  btnCancel: {
    background: "none",
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    padding: "8px 20px",
    fontSize: 14,
    cursor: "pointer",
    color: "#666",
  },
  btnSubmit: {
    background: "#f97316",
    border: "none",
    borderRadius: 6,
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
  },
}
