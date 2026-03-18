"use client"

import { forwardRef, CSSProperties } from "react"
import { CrossfitData } from "@/types/crossfit"
import styles from "./CrossfitCard.module.css"

export type CardVariant = 1 | 2 | 3 | 4 | 5

interface Props {
  data : CrossfitData
  variant ?: CardVariant
  bgImage ?: string
}

const fmt = (n : number) => n.toLocaleString("en-US")

// ── 테마 정의 ─────────────────────────────
const THEMES = {
  1: {
    // Dark Fire (검정 + 오렌지)
    bg: "#080808",
    topBar: "linear-gradient(90deg,#ff4500,#ff8c00)",
    title: "#ffffff",
    name: "#ff4500",
    rankNum: "#ffffff",
    slash: "#333333",
    total: "#444444",
    pct: "#ff4500",
    pctSub: "#333333",
    divider: "#1c1c1c",
    eventId: "#ff4500",
    eventIdDim: "#2a1000",
    eventName: "#cccccc",
    myRecord: "#555555",
    eventPctNum: "#ffffff",
    eventPctBar: "#ff4500",
    eventPctBarBg: "#1a1a1a",
  },
  2: {
    // White Clean (화이트)
    bg: "#f7f5f2",
    topBar: "#111111",
    title: "#111111",
    name: "#111111",
    rankNum: "#111111",
    slash: "#bbbbbb",
    total: "#aaaaaa",
    pct: "#111111",
    pctSub: "#aaaaaa",
    divider: "#e0ddd8",
    eventId: "#111111",
    eventIdDim: "#e8e5e0",
    eventName: "#333333",
    myRecord: "#aaaaaa",
    eventPctNum: "#111111",
    eventPctBar: "#111111",
    eventPctBarBg: "#e0ddd8",
  },
  3: {
    // Navy (네이비 + 시안)
    bg: "#070e1c",
    topBar: "linear-gradient(90deg,#00d4ff,#0070aa)",
    title: "#ffffff",
    name: "#00d4ff",
    rankNum: "#ffffff",
    slash: "#0d2240",
    total: "#1e3a5a",
    pct: "#00d4ff",
    pctSub: "#1e3a5a",
    divider: "#0d1e35",
    eventId: "#00d4ff",
    eventIdDim: "#040d18",
    eventName: "#7aa8cc",
    myRecord: "#1e3a5a",
    eventPctNum: "#ffffff",
    eventPctBar: "#00d4ff",
    eventPctBarBg: "#0d1e35",
  },
  4: {
    // Forest (다크 그린)
    bg: "#050e08",
    topBar: "linear-gradient(90deg,#00e676,#00a040)",
    title: "#ffffff",
    name: "#00e676",
    rankNum: "#ffffff",
    slash: "#0a2a10",
    total: "#154020",
    pct: "#00e676",
    pctSub: "#0a2a10",
    divider: "#0a1e0e",
    eventId: "#00e676",
    eventIdDim: "#030e05",
    eventName: "#5aaa70",
    myRecord: "#154020",
    eventPctNum: "#ffffff",
    eventPctBar: "#00e676",
    eventPctBarBg: "#0a1e0e",
  },
} as const

type ThemeKey = keyof typeof THEMES

function getTheme(variant : CardVariant, bgImage ?: string) {
  if (variant === 5) {
    // 사진 위 — 흰색 계열
    return {
      bg: "transparent",
      topBar: "rgba(255,255,255,0.6)",
      title: "#ffffff",
      name: "#ffffff",
      rankNum: "#ffffff",
      slash: "rgba(255,255,255,0.3)",
      total: "rgba(255,255,255,0.45)",
      pct: "#ffffff",
      pctSub: "rgba(255,255,255,0.45)",
      divider: "rgba(255,255,255,0.12)",
      eventId: "#ffffff",
      eventIdDim: "transparent",
      eventName: "rgba(255,255,255,0.75)",
      myRecord: "rgba(255,255,255,0.4)",
      eventPctNum: "#ffffff",
      eventPctBar: "rgba(255,255,255,0.85)",
      eventPctBarBg: "rgba(255,255,255,0.12)",
    }
  }
  return THEMES[variant as ThemeKey]
}

// ══════════════════════════════════════
// 메인 카드 레이아웃
// ══════════════════════════════════════
const CrossfitCard = forwardRef<HTMLDivElement, Props>(({ data, variant = 1, bgImage }, ref) => {
  const { year, handle, overallRank, totalAthletes, events } = data
  const t = getTheme(variant, bgImage)
  const overallPct = ((overallRank / totalAthletes) * 100).toFixed(1)

  const css = (s : CSSProperties) : CSSProperties => s

  return (
    <div ref={ref} className={styles.card}
      style={{ background: variant === 5 ? "#0a0a0a" : t.bg }}>

      {/* variant 5: 사진 배경 */}
      {variant === 5 && bgImage && (
        <>
          <div className={styles.bgPhoto}
            style={{ backgroundImage: `url(${bgImage})` }} />
          <div className={styles.bgOverlay} />
        </>
      )}

      {/* 상단 컬러 바 */}
      <div style={{ width: "100%", height: 10, flexShrink: 0,
        background: t.topBar, position: "relative", zIndex: 2 }} />

      {/* 본문 */}
      <div style={css({ flex: 1, display: "flex", flexDirection: "column",
        padding: "88px 96px 80px", position: "relative", zIndex: 2 })}>

        {/* ── 제목 ── */}
        <div style={css({ marginBottom: 48, display: "flex", justifyContent: "space-between" })}>
          <div>
            <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 88, letterSpacing: 5, lineHeight: 1,
              color: t.title })}>
            CROSSFIT OPEN
            </div>
            <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 88, letterSpacing: 5, lineHeight: 1,
              color: t.title, opacity: 0.25 })}>
              {year}
            </div>
          </div>
          {/* 로고 */}
          <img
            src={variant === 2 ? "/images/OpenLogo_black.png" : "/images/OpenLogo_white.png"}
            alt="CrossFit Open"
            style={{ width: 140, marginTop: 8, opacity: 0.85 }}
          />
        </div>

        {/* ── 이름 ── */}
        <div style={css({ fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 52, fontWeight: 700, letterSpacing: 2,
          color: t.name, marginBottom: 64, textTransform: "uppercase" })}>
          {handle || "—"}
        </div>

        {/* ── 등수 / 전체 ── */}
        <div style={css({ marginBottom: 12 })}>
          <div style={css({ fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 44, fontWeight: 700, letterSpacing: 6,
            color: t.total, textTransform: "uppercase",
            marginBottom: 12, opacity: 0.7 })}>
            Overall Rank
          </div>
          <div style={css({ display: "flex", alignItems: "baseline", gap: 16 })}>
            <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 148, color: t.rankNum,
              lineHeight: 0.85, letterSpacing: -2 })}>
              {fmt(overallRank)}
            </div>
            <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 80, color: t.slash, lineHeight: 0.85 })}>
              /
            </div>
            <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 80, color: t.total,
              lineHeight: 0.85, letterSpacing: -1 })}>
              {fmt(totalAthletes)}
            </div>
            <div style={css({ fontFamily: "'IBM Plex Sans KR', sans-serif",
              fontWeight: 700,
              fontSize: 60, color: t.total,
              lineHeight: 0.85, letterSpacing: -1 })}>
              명 중
            </div>
          </div>
        </div>

        {/* ── 총 퍼센타일 (메인 숫자) ── */}
        <div style={css({ marginBottom: 72 })}>
          <div style={css({ display: "flex", alignItems: "flex-end", gap: 8 })}>
            <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 260, color: t.pct,
              lineHeight: 0.82, letterSpacing: -6 })}>
              {overallPct}
            </div>
            <div style={css({ display: "flex", alignItems: "flex-end", gap: 6, paddingBottom: 16 })}>
              <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 100, color: t.pct,
                lineHeight: 0.82, opacity: 0.55 })}>
                  %
              </div>
              <div style={css({ fontFamily: "'Barlow Condensed',sans-serif",
                marginLeft: 10,
                fontSize: 60, fontWeight: 700, letterSpacing: 3,
                color: "#ff4500", opacity: 0.9,
                border: "1px solid #ff4500", borderRadius: 4,
                padding: "2px 10px", lineHeight: 1.4 })}>
                  Rx&apos;d
              </div>
            </div>
          </div>
        </div>

        {/* ── 구분선 ── */}
        <div style={css({ height: 1, background: t.divider, marginBottom: 56 })} />

        {/* ── 이벤트 목록 ── */}
        <div style={css({ flex: 1, display: "flex",
          flexDirection: "column", justifyContent: "space-between" })}>
          {events.map((ev, i) => (
            <div key={ev.id} style={css({
              display: "flex", gap: 36,
              paddingBottom: i < events.length - 1 ? 44 : 0,
              borderBottom: i < events.length - 1
                ? `1px solid ${t.divider}` : "none",
              marginBottom: i < events.length - 1 ? 44 : 0,
            })}>
              {/* 이벤트 ID */}
              <div style={css({ flexShrink: 0, width: 108 })}>
                <div style={css({ fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 72, color: t.eventId,
                  lineHeight: 0.9, letterSpacing: 1 })}>
                  {ev.id}
                </div>
              </div>

              {/* 이벤트 정보 */}
              <div style={css({ flex: 1, minWidth: 0 })}>
                {/* 운동 이름 */}
                <div style={css({ fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: 30, fontWeight: 700,
                  color: t.eventName, letterSpacing: 0.5,
                  lineHeight: 1.2, marginBottom: 8 })}>
                  {ev.name}
                </div>

                {/* 내 기록 */}
                <div style={css({ fontFamily: "'IBM Plex Sans KR', sans-serif", fontWeight: 700,
                  fontSize: 24, color: t.myRecord,
                  letterSpacing: 1, marginBottom: 14 })}>
                  {ev.isFinished
                    ? `${ev.myReps} reps · ${ev.myTime}`
                    : `${ev.myReps} reps (타임캡)`}
                </div>

                {/* 퍼센타일 바 + 숫자 */}
                <div style={css({ display: "flex",
                  alignItems: "center", gap: 20 })}>
                  <div style={css({ flex: 1, height: 4,
                    background: t.eventPctBarBg, borderRadius: 2,
                    overflow: "hidden" })}>
                    <div style={css({ height: "100%",
                      width: `${ev.pct}%`,
                      background: t.eventPctBar,
                      borderRadius: 2 })} />
                  </div>
                  <div style={css({ fontFamily: "'IBM Plex Sans KR', sans-serif", fontWeight: 700,
                    fontSize: 46, color: t.eventPctNum,
                    lineHeight: 1, flexShrink: 0,
                    letterSpacing: 0 })}>
                    상위 {ev.pct}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 하단 태그 ── */}
        <div style={css({ display: "flex", justifyContent: "space-between",
          alignItems: "center", paddingTop: 48,
          borderTop: `1px solid ${t.divider}`, marginTop: 32 })}>
          <div style={css({ fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 20, fontWeight: 700, letterSpacing: 4,
            color: t.divider, textTransform: "uppercase" })}>
            #{`CrossFitOpen${year}`}
          </div>
          <div style={css({ fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 18, fontWeight: 600, letterSpacing: 4,
            color: t.divider, textTransform: "uppercase" })}>
            Individual
          </div>
        </div>
      </div>
    </div>
  )
})

CrossfitCard.displayName = "CrossfitCard"
export default CrossfitCard