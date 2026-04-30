// src/app/box-info/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import styles from "./boxInfo.module.css"


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

export default function BoxInfoPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [page])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<PageResponse>("/api/posts", {
        params: { page, size: 20, sort: "createdAt,desc", category: "BOX_INFO" },
      })
      setData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      {/* 페이지 타이틀 */}
      <div className={styles.tabBar}>
        <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: 15, color: "#0ea5e9", borderBottom: "2px solid #0ea5e9" }}>
          📍 박스 정보
        </div>
      </div>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.empty}>불러오는 중...</div>
        ) : data?.content.length === 0 ? (
          <div className={styles.empty}>아직 등록된 박스 정보가 없어요.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: 48 }}>번호</th>
                <th className={styles.th}>제목</th>
                <th className={styles.th} style={{ width: 80 }}>작성자</th>
                <th className={styles.th} style={{ width: 56 }}>조회</th>
                <th className={styles.th} style={{ width: 72 }}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map((post) => (
                <tr
                  key={post.id}
                  className={styles.tr}
                  onClick={() => router.push(`/community/${post.id}`)}
                >
                  <td className={styles.tdNum}>{post.id}</td>
                  <td className={styles.tdTitle}>
                    {post.title}
                    {post.commentCount > 0 && (
                      <span className={styles.commentCount}>[{post.commentCount}]</span>
                    )}
                  </td>
                  <td className={styles.td}>{post.username}</td>
                  <td className={styles.td} style={{ textAlign: "right" }}>{post.viewCount}</td>
                  <td className={styles.td} style={{ textAlign: "right", color: "#bbb" }}>{formatDate(post.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button
                key={i}
                className={`${styles.pageBtn} ${page === i ? styles.pageBtnActive : ""}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}