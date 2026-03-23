"use client"

import { forwardRef, CSSProperties } from "react"
import { ProgramFormInput, ProgramWod } from "@/types/program"
import styles from "./ProgramCard.module.css"

interface Props {
  input : ProgramFormInput
  wod : ProgramWod
  bgImage ?: string
  movementFontSize ?: number
  logoSrc ?: string // ← 추가
  logoVariant ?: "dark" | "white" // ← 추가
}

const LEVEL_CONFIG = {
  RX: { label: "Rx'd", color: "#ff4500", bg: "rgba(255,69,0,0.25)" },
  SCALED: { label: "Scaled", color: "#00c8ff", bg: "rgba(0,200,255,0.25)" },
  MASTERS: { label: "Masters", color: "#c084fc", bg: "rgba(192,132,252,0.25)" },
}

function formatDate(dateStr : string) : { day : string; month : string; year : string } {
  if (!dateStr) {
    return { day: "", month: "", year: "" }
  }
  const d = new Date(dateStr)
  return {
    day: d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
    month: d.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase(),
    year: d.getFullYear().toString(),
  }
}

const ProgramCard = forwardRef<HTMLDivElement, Props>(
  ({ input, wod, bgImage, movementFontSize = 40, logoSrc, logoVariant = "white" }, ref) => {
    const { handle, date, level, recordType, recordTime, recordReps, recordSets, recordSetReps } = input
    const lv = LEVEL_CONFIG[level]
    const { day, month, year } = formatDate(date)
    const movementLines = wod.movements.split("\n").filter(Boolean)

    const css = (s : CSSProperties) : CSSProperties => s

    const isDark = logoVariant === "dark"
    const textPrimary = isDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.82)"
    const textSecondary = isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.6)"
    const textMuted = isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)"
    const borderColor = isDark ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"

    return (
      <div ref={ref} className={styles.card}>

        {/* ── 사진 배경 ── */}
        {bgImage
          ? <div className={styles.bgPhoto} style={{ backgroundImage: `url(${bgImage})` }} />
          : <div className={styles.bgFallback} />
        }
        <div className={styles.overlay} />

        {/* ── 컨텐츠 ── */}
        <div className={styles.content}>

          {/* ── 상단: 박스 로고 + 레벨 배지 ── */}
          <div style={css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}>
            {/* 박스 로고 */}
            {/* <img
              src={logoSrc ?? "/images/box_logo.png"}
              alt="Box Logo"
              style={{ height: 80, objectFit: "contain", opacity: 0.9 }}
            /> */}
            {/* 레벨 배지 */}
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 4,
              color: lv.color,
              background: lv.bg,
              border: `1.5px solid ${lv.color}`,
              borderRadius: 4,
              padding: "6px 20px",
              lineHeight: 1.3,
            })}>
              {lv.label}
            </div>
          </div>

          {/* ── 날짜 ── */}
          <div style={css({ marginTop: 56 })}>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: 6,
              color: textMuted,
              textTransform: "uppercase",
            })}>
              {day}
            </div>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: 3,
              color: textSecondary,
              marginTop: 4,
            })}>
              {month} · {year}
            </div>
          </div>

          {/* ── WOD 이름 + 카테고리 ── */}
          <div style={css({ marginTop: 40 })}>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: 6,
              color: lv.color,
              textTransform: "uppercase",
              marginBottom: 8,
            })}>
              {wod.category}
              {wod.timecap && (
                <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 16, fontSize: 36 }}>
                  CAP {Math.floor(wod.timecap / 60)}MIN
                </span>
              )}
            </div>
            <div style={css({
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: wod.name.length > 8 ? 110 : 150,
              color: textPrimary,
              lineHeight: 0.88,
              letterSpacing: 2,
            })}>
              {wod.name}
              <span
                style={css({
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: wod.name.length > 8 ? 50 : 80,
                  color: textPrimary,
                  lineHeight: 0.88,
                  letterSpacing: 2,
                })}
              > wod </span>
            </div>
          </div>

          {/* ── 구분선 ── */}
          <div style={css({ height: 1, background: "rgba(255,255,255,0.12)", margin: "48px 0" })} />

          {/* ── 운동 내용 ── */}
          <div style={css({ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" })}>
            {movementLines.map((line, i) => (
              <div key={i} style={css({
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: i < movementLines.length - 1 ? 18 : 0,
              })}>
                <div style={css({
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: lv.color,
                  flexShrink: 0,
                  marginTop: movementFontSize * 0.18,
                })} />

                {!line.startsWith("sub") ?
                  <div style={css({
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: movementFontSize,
                    fontWeight: 600,
                    color: textPrimary,
                    letterSpacing: 1,
                    lineHeight: 1.2,
                  })}>
                    {line}
                  </div>
                  :
                  <div style={css({
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: movementFontSize - 15,
                    fontWeight: 700,
                    color: textPrimary,
                    letterSpacing: 1,
                    lineHeight: 1.2,
                  })}>
                    {line.slice(3)}
                  </div>
                }
              </div>
            ))}
          </div>

          {/* ── 구분선 ── */}
          <div style={css({ height: 1, background: borderColor, margin: "48px 0 40px" })} />

          {/* ── 기록 ── */}
          <div>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 6,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 10,
              textTransform: "uppercase",
            })}>
              My Result
            </div>
            <div style={css({ fontFamily: "'Bebas Neue', sans-serif", fontSize: 150, color: textPrimary, lineHeight: 0.85, letterSpacing: -2 })}>
              {recordType === "time"
                ? (recordTime || "--:--")
                : recordType === "reps"
                  ? recordReps > 0
                    ? <>{recordReps.toLocaleString()}<span style={{ fontSize: 80, marginLeft: 12 }}>reps</span></>
                    : "---"
                  : recordType === "sets"
                    ? (recordSets > 0 || recordSetReps > 0)
                      ? <>{recordSets}R<span style={{ fontSize: 80 }}> + </span>{recordSetReps}</>
                      : "---"
                    : "---"
              }
            </div>
            <div style={css({ fontSize: 26, fontWeight: 600, letterSpacing: 4, color: lv.color, marginTop: 10 })}>
              {recordType === "time" ? "TIME" : recordType === "reps" ? "REPS" : "SETS"}
            </div>
          </div>

          {/* ── 하단: 이름 ── */}
          <div style={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 40,
            color: textMuted,
            marginTop: 40,
          })}>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: 2,
              color: textSecondary,
            })}>
              {handle || "@athlete"}
            </div>
            <div style={css({
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 3,
              color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
            })}>
              #CrossFit
            </div>
          </div>

        </div>
      </div>
    )
  }
)

ProgramCard.displayName = "ProgramCard"
export default ProgramCard