"use client"

import { WodFormInput, WodLevel, WodRecordType } from "@/types/wod"
import styles from "./WodForm.module.css"

interface Props {
  input : WodFormInput
  onChange : (input : WodFormInput) => void
  onCalc : () => void
  loading ?: boolean
  hideCalcBtn ?: boolean // ← 추가
}

const LEVELS : { id : WodLevel; label : string; color : string }[] = [
  { id: "RX", label: "Rx'd", color: "#ff4500" },
  { id: "SCALED", label: "Scaled", color: "#00c8ff" },
  { id: "MASTERS", label: "Masters", color: "#c084fc" },
]

export default function WodForm({ input, onChange, onCalc, loading, hideCalcBtn } : Props) {
  const set = (patch : Partial<WodFormInput>) => onChange({ ...input, ...patch })

  return (
    <div className={styles.form}>

      {/* ── 기본 정보 ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>기본 정보</div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>이름 / 닉네임</label>
            <input
              className={styles.input}
              value={input.handle}
              onChange={(e) => set({ handle: e.target.value })}
              placeholder="@mingoojo"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>날짜</label>
            <input
              className={styles.input}
              type="date"
              value={input.date}
              onChange={(e) => set({ date: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ── WOD 정보 ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>WOD</div>

        <div className={styles.field}>
          <label className={styles.label}>WOD 이름</label>
          <input
            className={styles.input}
            value={input.wodName}
            onChange={(e) => set({ wodName: e.target.value })}
            placeholder="FRAN / CINDY / 오늘의 WOD"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            운동 내용 <span className={styles.labelSub}>(줄바꿈으로 구분)</span>
          </label>
          <textarea
            className={styles.textarea}
            value={input.movements}
            onChange={(e) => set({ movements: e.target.value })}
            placeholder={"21-15-9\nThrusters 43kg\nPull-ups"}
            rows={5}
          />
        </div>
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

        {/* 기록 타입 토글 */}
        <div className={styles.recordTypeToggle}>
          <button
            type="button"
            className={`${styles.recordTypeBtn} ${input.recordType === "time" ? styles.recordTypeBtnActive : ""}`}
            onClick={() => set({ recordType: "time" })}
          >
            ⏱ 시간
          </button>
          <button
            type="button"
            className={`${styles.recordTypeBtn} ${input.recordType === "reps" ? styles.recordTypeBtnActive : ""}`}
            onClick={() => set({ recordType: "reps" })}
          >
            🔁 횟수
          </button>
        </div>

        {input.recordType === "time" ? (
          <div className={styles.field}>
            <label className={styles.label}>완료 시간</label>
            <input
              className={styles.input}
              value={input.recordTime}
              onChange={(e) => set({ recordTime: e.target.value })}
              placeholder="MM:SS 또는 H:MM:SS"
            />
          </div>
        ) : (
          <div className={styles.field}>
            <label className={styles.label}>총 횟수 (reps)</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={input.recordReps || ""}
              onChange={(e) => set({ recordReps: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        )}
      </div>

      {/* ── 카드 만들기 버튼 ── */}
      {/* <button
        className={styles.calcBtn}
        onClick={onCalc}
        disabled={!input.handle || !input.wodName}
      >
        🏋️ 카드 만들기
      </button> */}

      {!hideCalcBtn && (
        <button className={styles.calcBtn} onClick={onCalc} disabled={!input.handle || !input.wodName}>
    🏋️ 카드 만들기
        </button>
      )}

      {(!input.handle || !input.wodName) && (
        <p className={styles.hint}>이름과 WOD 이름을 입력해주세요</p>
      )}
    </div>
  )
}