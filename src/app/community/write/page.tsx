"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

const CATEGORIES = [
  { label: "크로스핏", value: "CROSSFIT" },
  { label: "러닝", value: "RUNNING" },
  { label: "하이록스", value: "HYROX" },
  { label: "박스 정보", value: "BOX_INFO" },
  { label: "대회·이벤트", value: "EVENT" },
  { label: "자유", value: "FREE" },
]

export default function WritePage() {
  const router = useRouter()
  const [form, setForm] = useState({ category: "CROSSFIT", title: "", content: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post("/api/posts", form)
      router.push(`/community/${data.id}`)
    } catch (err : any) {
      setError(err.response?.data?.message ?? "글 작성에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.back} onClick={() => router.back()}>← 뒤로</button>
          <h2 style={s.title}>글쓰기</h2>
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
            <button type="button" style={s.btnCancel} onClick={() => router.back()}>취소</button>
            <button type="submit" style={s.btnSubmit} disabled={loading}>
              {loading ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s : Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" },
  container: { maxWidth: 720, margin: "0 auto", padding: "24px 16px" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  back: { background: "none", border: "none", fontSize: 14, cursor: "pointer", color: "#666" },
  title: { fontSize: 18, fontWeight: 700, color: "#111" },
  form: { background: "#fff", borderRadius: 8, padding: 24, border: "1px solid #e5e5e5", display: "flex", flexDirection: "column", gap: 12 },
  select: { border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 12px", fontSize: 14, outline: "none" },
  input: { border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 12px", fontSize: 14, outline: "none" },
  textarea: { border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 12px", fontSize: 14, outline: "none", minHeight: 300, resize: "vertical" },
  error: { color: "#ef4444", fontSize: 13 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 },
  btnCancel: { background: "none", border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 20px", fontSize: 14, cursor: "pointer", color: "#666" },
  btnSubmit: { background: "#f97316", border: "none", borderRadius: 6, padding: "8px 20px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" },
}