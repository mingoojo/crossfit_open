"use client"

import { FormInput, WOD_CONFIGS, WodInput } from "@/types/crossfit"
import styles from "./CrossfitForm.module.css"

interface Props {
  input : FormInput
  onChange : (input : FormInput) => void
  onCalc : () => void
  loading : boolean
}

export default function CrossfitForm({ input, onChange, onCalc, loading } : Props) {
  const set = (patch : Partial<FormInput>) => onChange({ ...input, ...patch })

  const setWod = (key : "wod1" | "wod2" | "wod3", patch : Partial<WodInput>) =>
    onChange({ ...input, [key]: { ...input[key], ...patch } })

  const wodKeys = ["wod1", "wod2", "wod3"] as const

  return (
    <div className={styles.form}>
      {/* 기본 정보 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>기본 정보</div>

        {/* 성별 토글 */}
        <div className={styles.field}>
          <label className={styles.label}>성별</label>
          <div className={styles.genderToggle}>
            <button
              className={`${styles.genderBtn} ${input.gender === "M" ? styles.genderBtnActive : ""}`}
              onClick={() => set({ gender: "M" })}
              type="button"
            >
              🏋️ 남성 (Men)
            </button>
            <button
              className={`${styles.genderBtn} ${input.gender === "W" ? styles.genderBtnActive : ""}`}
              onClick={() => set({ gender: "W" })}
              type="button"
            >
              🏋️ 여성 (Women)
            </button>
          </div>
        </div>

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

      {/* WOD 입력 */}
      {WOD_CONFIGS.map((cfg, i) => {
        const key = wodKeys[i]
        const wod = input[key]
        const isFinished = wod.reps >= cfg.maxReps
        const timecapStr = `${Math.floor(cfg.timecap / 60)}:${String(cfg.timecap % 60).padStart(2, "0")}`

        return (
          <div key={cfg.id} className={styles.section}>
            <div className={styles.sectionTitle}>{cfg.id}</div>
            <div className={styles.eventMeta}>{cfg.name}</div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Reps <span className={styles.labelSub}>(최대 {cfg.maxReps})</span>
                </label>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={cfg.maxReps}
                  value={wod.reps || ""}
                  onChange={(e) => setWod(key, { reps: Number(e.target.value) })}
                  placeholder={`0 ~ ${cfg.maxReps}`}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  완주 시간
                  {!isFinished && <span className={styles.labelSub}> (미완주)</span>}
                </label>
                <input
                  className={`${styles.input} ${!isFinished ? styles.inputDisabled : ""}`}
                  value={isFinished ? wod.time : timecapStr}
                  onChange={(e) => setWod(key, { time: e.target.value })}
                  placeholder="11:30"
                  disabled={!isFinished}
                />
              </div>
            </div>

            <div className={styles.wodStatus}>
              {isFinished ? (
                <span className={styles.statusDone}>✓ 완주 · 시간 입력 필요</span>
              ) : wod.reps > 0 ? (
                <span className={styles.statusPartial}>타임캡 · {wod.reps} reps</span>
              ) : (
                <span className={styles.statusEmpty}>미입력</span>
              )}
            </div>
          </div>
        )
      })}

      {/* 계산 버튼 */}
      <button
        className={`${styles.calcBtn} ${loading ? styles.calcBtnLoading : ""}`}
        onClick={onCalc}
        disabled={loading || !input.handle}
      >
        {loading ? "계산 중..." : "🏆 순위 계산하기"}
      </button>

      {!input.handle && (
        <p className={styles.hint}>이름을 먼저 입력해주세요</p>
      )}
    </div>
  )
}