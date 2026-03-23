"use client"

import { forwardRef, CSSProperties } from "react"
import { WodFormInput } from "@/types/wod"
import styles from "./WodCard.module.css"

interface Props {
  data : WodFormInput
  bgImage ?: string
  movementFontSize ?: number // ← 추가
}


const LEVEL_CONFIG = {
  RX: { label: "Rx'd", color: "#ff4500", bg: "rgba(255,69,0,0.2)" },
  SCALED: { label: "Scaled", color: "#00c8ff", bg: "rgba(0,200,255,0.2)" },
  MASTERS: { label: "Masters", color: "#c084fc", bg: "rgba(192,132,252,0.2)" },
}

function formatDate(dateStr : string) : string {
  if (!dateStr) {
    return ""
  }
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).toUpperCase()
}

const WodCard = forwardRef<HTMLDivElement, Props>(({ data, bgImage, movementFontSize }, ref) => {
  const { handle, date, wodName, movements, recordType, recordTime, recordReps, level } = data
  const lv = LEVEL_CONFIG[level]
  const movementLines = movements.split("\n").filter(Boolean)

  const css = (s : CSSProperties) : CSSProperties => s

  return (
    <div ref={ref} className={styles.card}>

      {/* ── 사진 배경 ── */}
      {bgImage ? (
        <div className={styles.bgPhoto} style={{ backgroundImage: `url(${bgImage})` }} />
      ) : (
        <div className={styles.bgFallback} />
      )}

      {/* ── 그라디언트 오버레이 ── */}
      <div className={styles.overlay} />

      {/* ── 컨텐츠 ── */}
      <div className={styles.content}>

        {/* ── 상단: 날짜 + 레벨 배지 ── */}
        <div style={css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}>
          <div style={css({
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.55)",
          })}>
            {formatDate(date)}
          </div>
          <div style={css({
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 3,
            color: lv.color,
            background: lv.bg,
            border: `1px solid ${lv.color}`,
            borderRadius: 4,
            padding: "4px 18px",
          })}>
            {lv.label}
          </div>
        </div>

        {/* ── WOD 이름 ── */}
        <div style={css({ marginTop: 48 })}>
          <div style={css({
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 8,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            marginBottom: 8,
          })}>
            TODAY&apos;S WOD
          </div>
          <div style={css({
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: wodName.length > 10 ? 120 : 160,
            color: "#ffffff",
            lineHeight: 0.9,
            letterSpacing: 2,
            textShadow: "0 4px 40px rgba(0,0,0,0.5)",
          })}>
            {wodName || "WOD"}
          </div>
        </div>

        {/* ── 구분선 ── */}
        <div style={css({
          height: 1,
          background: "rgba(255,255,255,0.15)",
          margin: "52px 0",
        })} />

        {/* ── 운동 내용 ── */}
        <div style={css({ flex: 1 })}>
          {movementLines.map((line, i) => (
            <div key={i} style={css({
              display: "flex",
              alignItems: "baseline",
              gap: 20,
              marginBottom: i < movementLines.length - 1 ? 20 : 0,
            })}>
              <div style={css({
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: lv.color,
                flexShrink: 0,
                marginTop: 4,
                alignSelf: "flex-start",
                marginLeft: 4,
              })} />
              <div style={css({
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: movementFontSize ?? 42,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: 1,
                lineHeight: 1.2,
              })}>
                {line}
              </div>
            </div>
          ))}
        </div>

        {/* ── 구분선 ── */}
        <div style={css({
          height: 1,
          background: "rgba(255,255,255,0.15)",
          margin: "52px 0 40px",
        })} />

        {/* ── 기록 ── */}
        <div style={css({ display: "flex", justifyContent: "space-between", alignItems: "flex-end" })}>
          <div>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 6,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 8,
              textTransform: "uppercase",
            })}>
              My Result
            </div>
            <div style={css({
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 160,
              color: "#ffffff",
              lineHeight: 0.85,
              letterSpacing: -2,
              textShadow: `0 0 60px ${lv.color}60`,
            })}>
              {recordType === "time"
                ? (recordTime || "--:--")
                : (recordReps > 0 ? (
                  <>{recordReps.toLocaleString()}
                    <span>reps</span>
                  </>
                ) : "---")}
            </div>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 4,
              color: lv.color,
              marginTop: 8,
            })}>
              {recordType === "time" ? "TIME" : "REPS"}
            </div>
          </div>
        </div>

        {/* ── 하단 핸들 + 해시태그 ── */}
        <div style={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 40,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          marginTop: 40,
        })}>
          <div style={css({
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.7)",
          })}>
            {handle || "@athlete"}
          </div>
          <div style={css({
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          })}>
            #CrossFit
          </div>
        </div>

      </div>
    </div>
  )
})

WodCard.displayName = "WodCard"
export default WodCard