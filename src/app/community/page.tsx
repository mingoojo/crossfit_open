// src/app/community/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import styles from "./community.module.css"

type Category = "ALL" | "CROSSFIT" | "RUNNING" | "HYROX" | "FREE"

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
  { label: "자유", value: "FREE" },
]

const CATEGORY_COLOR : Record<string, string> = {
  CROSSFIT: "#f97316",
  RUNNING: "#22c55e",
  HYROX: "#6366f1",
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
  const searchParams = useSearchParams()

  // URL ?category= 파라미터로 초기값 설정
  const initCategory = (searchParams.get("category") as Category) ?? "ALL"
  const [category, setCategory] = useState<Category>(initCategory)
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse | null>(null)
  const [loading, setLoading] = useState(false)

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
    router.replace(`/community?category=${cat}`)
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.tabBar}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`${styles.tab} ${category === c.value ? styles.tabActive : ""}`}
            onClick={() => handleCategoryChange(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.empty}>불러오는 중...</div>
        ) : data?.content.length === 0 ? (
          <div className={styles.empty}>게시글이 없습니다.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: 48 }}>번호</th>
                <th className={styles.th} style={{ width: 80 }}>카테고리</th>
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
                  <td className={styles.td}>
                    <span
                      className={styles.badge}
                      style={{
                        background: CATEGORY_COLOR[post.category] + "22",
                        color: CATEGORY_COLOR[post.category],
                      }}
                    >
                      {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
                    </span>
                  </td>
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