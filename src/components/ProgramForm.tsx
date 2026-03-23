"use client"

import { useState, useEffect } from "react"
import { ProgramFormInput, ProgramWod } from "@/types/program"
import styles from "./ProgramForm.module.css"

interface Props {
  input : ProgramFormInput
  onChange : (input : ProgramFormInput) => void
  onCalc : (wod : ProgramWod) => void
  onWodChange ?: (wod : ProgramWod | null) => void // ← 추가
  hideCalcBtn ?: boolean
}

type WodLevel = "RX" | "SCALED" | "MASTERS"

const LEVELS : { id : WodLevel; label : string; color : string }[] = [
  { id: "RX", label: "Rx'd", color: "#ff4500" },
  { id: "SCALED", label: "Scaled", color: "#00c8ff" },
  { id: "MASTERS", label: "Masters", color: "#c084fc" },
]

function getDaysInMonth(year : number, month : number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year : number, month : number) {
  return new Date(year, month, 1).getDay()
}
function toDateStr(year : number, month : number, day : number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

export default function ProgramForm({ input, onChange, onCalc, onWodChange, hideCalcBtn } : Props) {
  const set = (patch : Partial<ProgramFormInput>) => onChange({ ...input, ...patch })


  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  // 전체 프로그램 데이터 (달력 표시 + WOD 조회용)
  const [programData, setProgramData] = useState<Record<string, ProgramWod>>({})

  useEffect(() => {
    fetch("/data/program.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setProgramData(data))
      .catch(() => {})
  }, [])

  const wod = programData[input.date] ?? null


  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalYear(y => y - 1); setCalMonth(11)
    } else {
      setCalMonth(m => m - 1)
    }
  }
  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalYear(y => y + 1); setCalMonth(0)
    } else {
      setCalMonth(m => m + 1)
    }
  }

  useEffect(() => {
    onWodChange?.(wod)
  }, [wod])

  return (
    <div className={styles.form}>

      {/* ── 기본 정보 ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>기본 정보</div>
        <div className={styles.field}>
          <label className={styles.label}>이름 / 닉네임</label>
          <input
            className={styles.input}
            value={input.handle}
            onChange={(e) => set({ handle: e.target.value })}
            placeholder="@mingoojo"
          />
        </div>
      </div>

      {/* ── 달력 ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>날짜 선택</div>

        <div className={styles.calendar}>
          <div className={styles.calHeader}>
            <button className={styles.calNavBtn} onClick={handlePrevMonth}>‹</button>
            <span className={styles.calTitle}>{calYear}년 {MONTHS[calMonth]}</span>
            <button className={styles.calNavBtn} onClick={handleNextMonth}>›</button>
          </div>

          <div className={styles.calWeekdays}>
            {WEEKDAYS.map((d) => (
              <div key={d} className={styles.calWeekday}>{d}</div>
            ))}
          </div>

          <div className={styles.calDays}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = toDateStr(calYear, calMonth, day)
              const isSelected = input.date === dateStr
              const isToday = dateStr === today.toISOString().slice(0, 10)
              const hasWod = !!programData[dateStr]

              return (
                <button
                  key={day}
                  className={`
                    ${styles.calDay}
                    ${isSelected ? styles.calDaySelected : ""}
                    ${isToday && !isSelected ? styles.calDayToday : ""}
                    ${hasWod && !isSelected ? styles.calDayHasWod : ""}
                  `}
                  onClick={() => set({ date: dateStr })}
                >
                  {day}
                  {hasWod && (
                    <span className={`${styles.calDot} ${isSelected ? styles.calDotSelected : ""}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* WOD 미리보기 */}
        {input.date && (
          <div className={styles.wodPreview}>
            {wod ? (
              <>
                <div className={styles.wodPreviewCategory}>{wod.category}</div>
                <div className={styles.wodPreviewName}>{wod.name}</div>
                <div className={styles.wodPreviewMovements}>
                  {wod.movements.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className={styles.wodPreviewLine}>· {line}</div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.wodPreviewEmpty}>이 날은 운동이 없습니다</div>
            )}
          </div>
        )}
      </div>

      {/* ── 레벨 ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>레벨</div>
        <div className={styles.levelToggle}>
          {LEVELS.map((lv) => (
            <button
              key={lv.id}
              type="button"
              className={`${styles.levelBtn} ${input.level === lv.id ? styles.levelBtnActive : ""}`}
              style={{ "--lv-color": lv.color } as React.CSSProperties}
              onClick={() => set({ level: lv.id })}
            >
              {lv.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 기록 ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>내 기록</div>
        <div className={styles.recordTypeToggle}>
          <button
            type="button"
            className={`${styles.recordTypeBtn} ${input.recordType === "time" ? styles.recordTypeBtnActive : ""}`}
            onClick={() => set({ recordType: "time" })}
          >⏱ 시간</button>
          <button
            type="button"
            className={`${styles.recordTypeBtn} ${input.recordType === "reps" ? styles.recordTypeBtnActive : ""}`}
            onClick={() => set({ recordType: "reps" })}
          >🔁 횟수</button>
          <button type="button"
            className={`${styles.recordTypeBtn} ${input.recordType === "sets" ? styles.recordTypeBtnActive : ""}`}
            onClick={() => set({ recordType: "sets" })}>💪 세트</button>
        </div>

        {input.recordType === "time" && (
          <div className={styles.field}>
            <label className={styles.label}>완료 시간</label>
            <input className={styles.input} value={input.recordTime}
              onChange={(e) => set({ recordTime: e.target.value })}
              placeholder="MM:SS 또는 H:MM:SS" />
          </div>
        )}

        {input.recordType === "reps" && (
          <div className={styles.field}>
            <label className={styles.label}>총 횟수 (reps)</label>
            <input className={styles.input} type="number" min={0}
              value={input.recordReps || ""}
              onChange={(e) => set({ recordReps: Number(e.target.value) })}
              placeholder="0" />
          </div>
        )}

        {input.recordType === "sets" && (
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>세트 수</label>
              <input className={styles.input} type="number" min={0}
                value={input.recordSets || ""}
                onChange={(e) => set({ recordSets: Number(e.target.value) })}
                placeholder="4" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>개수</label>
              <input className={styles.input} type="number" min={0}
                value={input.recordSetReps || ""}
                onChange={(e) => set({ recordSetReps: Number(e.target.value) })}
                placeholder="12" />
            </div>
          </div>
        )}
      </div>

      {/* ── 카드 만들기 버튼 ── */}
      {!hideCalcBtn && (
        <>
          <button
            className={styles.calcBtn}
            onClick={() => wod && onCalc(wod)}
            disabled={!input.handle || !input.date || !wod}
          >
            🏋️ 카드 만들기
          </button>
          {(!input.handle || !input.date || !wod) && (
            <p className={styles.hint}>
              {!wod ? "운동이 있는 날짜를 선택해주세요" : "이름을 입력해주세요"}
            </p>
          )}
        </>
      )}
    </div>
  )
}