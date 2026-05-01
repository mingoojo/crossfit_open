// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import styles from "./main.module.css"

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
  { label: "자유", value: "FREE", color: "#999" },
]

const BOX = { label: "박스 정보", value: "BOX_INFO", color: "#0ea5e9" }
const EVENT = { label: "대회·이벤트", value: "EVENT", color: "#ec4899" }

const ALL_BOARDS = [...BOARDS, BOX, EVENT]

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
  board : { label : string; value : string; color : string }
  posts : Post[]
  onPostClick : (id : number) => void
  onMoreClick : (cat : string) => void
}) {
  return (
    <div className={styles.board}>
      <div className={styles.boardHeader}>
        <span className={styles.boardDot} style={{ background: board.color }} />
        <span className={styles.boardTitle}>{board.label}</span>
        <button className={styles.boardMore} onClick={() => onMoreClick(board.value)}>
          더보기 +
        </button>
      </div>
      <ul className={styles.boardList}>
        {posts.length === 0 && <li className={styles.boardEmpty}>아직 글이 없어요</li>}
        {posts.map((post) => (
          <li key={post.id} className={styles.boardItem} onClick={() => onPostClick(post.id)}>
            <span className={styles.boardItemTitle}>
              {post.title}
              {post.commentCount > 0 && (
                <span style={{ color: board.color, fontSize: 11, marginLeft: 4 }}>
                  [{post.commentCount}]
                </span>
              )}
            </span>
            <span className={styles.boardItemMeta}>{formatDate(post.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SLIDES = [
  {
    id: 1,
    bg: "linear-gradient(135deg, #1a1a1a 0%, #2a1810 100%)",
    tag: "2026 CrossFit Open",
    title: "나의 순위를 확인하세요",
    sub: "전 세계 크로스피터들과 함께",
    cta: "순위 보기",
    href: "/open",
    accent: "#f97316",
  },
  {
    id: 2,
    bg: "linear-gradient(135deg, #0f1f0f 0%, #1a2e1a 100%)",
    tag: "러닝 커뮤니티",
    title: "함께 달리는 즐거움",
    sub: "러닝 메이트를 찾아보세요",
    cta: "게시판 가기",
    href: "/community?category=RUNNING",
    accent: "#22c55e",
  },
  {
    id: 3,
    bg: "linear-gradient(135deg, #0f0f1f 0%, #1a1a2e 100%)",
    tag: "HYROX",
    title: "하이록스 도전자 모집",
    sub: "국내 하이록스 커뮤니티",
    cta: "참여하기",
    href: "/community?category=HYROX",
    accent: "#6366f1",
  },
]

function Carousel() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <div className={styles.carousel} style={{ background: slide.bg }}>
      <div className={styles.carouselContent}>
        <span className={styles.carouselTag} style={{ color: slide.accent, borderColor: slide.accent }}>
          {slide.tag}
        </span>
        <h2 className={styles.carouselTitle}>{slide.title}</h2>
        <p className={styles.carouselSub}>{slide.sub}</p>
        <button
          className={styles.carouselCta}
          style={{ background: slide.accent }}
          onClick={() => router.push(slide.href)}
        >
          {slide.cta} →
        </button>
      </div>

      <div className={styles.carouselDots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.carouselDot} ${i === current ? styles.carouselDotActive : ""}`}
            style={i === current ? { background: slide.accent } : {}}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      <button className={styles.carouselPrev} onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
      <button className={styles.carouselNext} onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}>›</button>
    </div>
  )
}

export default function MainPage() {
  const router = useRouter()
  const [hotPosts, setHotPosts] = useState<Post[]>([])
  const [boardPosts, setBoardPosts] = useState<Record<string, Post[]>>({})
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [hotRes, recentRes, ...boardRes] = await Promise.all([
        api.get<PageResponse>("/api/posts", { params: { page: 0, size: 5, sort: "viewCount,desc" } }),
        api.get<PageResponse>("/api/posts", { params: { page: 0, size: 8, sort: "createdAt,desc" } }),
        ...ALL_BOARDS.map((b) =>
          api.get<PageResponse>("/api/posts", {
            params: { page: 0, size: 5, sort: "createdAt,desc", category: b.value },
          })
        ),
      ])
      setHotPosts(hotRes.data.content)
      setRecentPosts(recentRes.data.content)
      const map : Record<string, Post[]> = {}
      ALL_BOARDS.forEach((b, i) => {
        map[b.value] = boardRes[i].data.content
      })
      setBoardPosts(map)
    } catch (e) {
      console.error(e)
    }
  }

  const handlePostClick = (id : number) => router.push(`/community/${id}`)
  const handleMoreClick = (cat : string) => {
    if (cat === "BOX_INFO") {
      router.push("/box-info")
    } else if (cat === "EVENT") {
      router.push("/event")
    } else {
      router.push(`/community?category=${cat}`)
    }
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Carousel />
        <div className={styles.mainInner}>
          <div className={styles.left}>

            {/* 커뮤니티 - 2열 그리드 */}
            <div className={styles.boardGrid}>
              {BOARDS.map((b) => (
                <BoardSection
                  key={b.value}
                  board={b}
                  posts={boardPosts[b.value] ?? []}
                  onPostClick={handlePostClick}
                  onMoreClick={handleMoreClick}
                />
              ))}
            </div>

            <div className={styles.divider} />

            {/* 박스 정보 - 1열 풀width */}
            <div className={styles.boardGridSingle}>
              <BoardSection
                board={BOX}
                posts={boardPosts[BOX.value] ?? []}
                onPostClick={handlePostClick}
                onMoreClick={handleMoreClick}
              />
            </div>

            <div className={styles.divider} />

            {/* 대회·이벤트 - 1열 풀width */}
            <div className={styles.boardGridSingle}>
              <BoardSection
                board={EVENT}
                posts={boardPosts[EVENT.value] ?? []}
                onPostClick={handlePostClick}
                onMoreClick={handleMoreClick}
              />
            </div>

          </div>

          <aside className={styles.aside}>
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <span className={styles.widgetDot} />
                🔥 실시간 인기글
              </div>
              <ul className={styles.widgetList}>
                {hotPosts.length === 0 && <li className={styles.boardEmpty}>아직 글이 없어요</li>}
                {hotPosts.map((post, i) => (
                  <li key={post.id} className={styles.widgetItem} onClick={() => handlePostClick(post.id)}>
                    <span className={styles.widgetRank}>{i + 1}</span>
                    <span className={styles.widgetTitle}>
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

            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <span className={styles.widgetDot} />
                📋 최근 글
              </div>
              <ul className={styles.widgetList}>
                {recentPosts.length === 0 && <li className={styles.boardEmpty}>아직 글이 없어요</li>}
                {recentPosts.map((post) => (
                  <li key={post.id} className={styles.widgetItem} onClick={() => handlePostClick(post.id)}>
                    <span className={styles.widgetTitle}>{post.title}</span>
                    <span className={styles.widgetDate}>{formatDate(post.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <span className={styles.widgetDot} />
                📌 바로가기
              </div>
              <div className={styles.shortcutGrid}>
                {ALL_BOARDS.map((b) => (
                  <button
                    key={b.value}
                    className={styles.shortcut}
                    style={{ borderColor: b.color, color: b.color }}
                    onClick={() => handleMoreClick(b.value)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}