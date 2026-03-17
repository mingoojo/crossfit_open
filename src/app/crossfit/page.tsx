"use client"

import { useRef, useState, useCallback } from "react"
import { CrossfitData, FormInput, DEFAULT_FORM_INPUT } from "@/types/crossfit"
import { useCardScale } from "@/hooks/useCardScale"
import { loadAthletes, calcRank } from "@/lib/calcRank"
import CrossfitForm from "@/components/CrossfitForm"
import CrossfitCard, { CardVariant } from "@/components/CrossfitCard"
import styles from "./crossfit.module.css"

const VARIANTS : { id : CardVariant; label : string; color : string }[] = [
  { id: 1, label: "Dark Fire", color: "#ff4500" },
  { id: 2, label: "Midnight", color: "#00c8ff" },
  { id: 3, label: "Clean", color: "#111111" },
  { id: 4, label: "Forest", color: "#00e676" },
  { id: 5, label: "My Photo", color: "#e0c97f" },
]

export default function CrossfitPage() {
  const [formInput, setFormInput] = useState<FormInput>(DEFAULT_FORM_INPUT)
  const [cardData, setCardData] = useState<CrossfitData | null>(null)
  const [variant, setVariant] = useState<CardVariant>(1)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const wrapperScaleRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { wrapperRef, scale } = useCardScale()

  // ── 순위 계산 ──
  const handleCalc = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const athletes = await loadAthletes()
      const { cardData } = calcRank(athletes, formInput)
      setCardData(cardData)
    } catch (err) {
      console.error(err)
      setError("athletes.json 로드 실패. public/data/athletes.json 을 확인해주세요.")
    } finally {
      setLoading(false)
    }
  }, [formInput])

  // ── 사진 업로드 ──
  const handlePhotoUpload = useCallback((e : React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    // 기존 object URL 해제
    if (bgImage?.startsWith("blob:")) {
      URL.revokeObjectURL(bgImage)
    }

    const url = URL.createObjectURL(file)
    setBgImage(url)
  }, [bgImage])

  const handlePhotoDrop = useCallback((e : React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith("image/")) {
      return
    }
    if (bgImage?.startsWith("blob:")) {
      URL.revokeObjectURL(bgImage)
    }
    setBgImage(URL.createObjectURL(file))
  }, [bgImage])

  // ── 이미지 저장 ──
  const handleSave = useCallback(async () => {
    if (!cardRef.current || !wrapperScaleRef.current || saving || !cardData) {
      return
    }
    setSaving(true)
    try {
      const html2canvas = (await import("html2canvas")).default

      const wrapper = wrapperScaleRef.current
      const prev = wrapper.style.transform
      const prevMargin = wrapper.style.marginBottom
      wrapper.style.transform = "none"
      wrapper.style.marginBottom = "0"

      const canvas = await html2canvas(cardRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#080808",
        logging: false,
      })

      wrapper.style.transform = prev
      wrapper.style.marginBottom = prevMargin

      const link = document.createElement("a")
      link.download = `crossfit_open_${cardData.year}_style${variant}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error(err)
      alert("이미지 저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }, [cardData, variant, saving])

  return (
    <div className={styles.page}>
      {/* 왼쪽: 폼 */}
      <aside className={styles.formPanel}>
        <div className={styles.formHeader}>
          <p className={styles.formSubtitle}>CrossFit Open 2026</p>
          <h1 className={styles.formTitle}>카드 만들기</h1>
        </div>
        <div className={styles.formScroll}>
          <CrossfitForm
            input={formInput}
            onChange={setFormInput}
            onCalc={handleCalc}
            loading={loading}
          />
          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
      </aside>

      {/* 오른쪽: 프리뷰 */}
      <main className={styles.previewPanel}>
        <div className={styles.previewMeta}>
          {/* 스타일 토글 */}
          <div className={styles.variantToggle}>
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                className={`${styles.variantBtn} ${variant === v.id ? styles.variantBtnActive : ""}`}
                style={{ "--v-color": v.color } as React.CSSProperties}
                onClick={() => setVariant(v.id)}
              >
                <span className={styles.variantDot} />
                {v.label}
              </button>
            ))}
          </div>

          {cardData && (
            <button
              className={`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ""}`}
              onClick={handleSave}
              disabled={saving}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {saving ? "저장 중..." : "이미지 저장"}
            </button>
          )}
        </div>

        {/* variant 5 전용: 사진 업로드 바 */}
        {variant === 5 && (
          <div
            className={`${styles.photoUploadBar} ${bgImage ? styles.photoUploadBarDone : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handlePhotoDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
            {bgImage ? (
              <>
                <div
                  className={styles.photoThumb}
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
                <span className={styles.photoUploadText}>사진 변경 (클릭 또는 드래그)</span>
                <button
                  className={styles.photoRemoveBtn}
                  onClick={(e) => {
                    e.stopPropagation(); setBgImage(null)
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className={styles.photoUploadText}>사진 업로드 (클릭 또는 드래그)</span>
              </>
            )}
          </div>
        )}

        {/* 카드 프리뷰 */}
        <div ref={wrapperRef} className={styles.cardWrapper}>
          {cardData ? (
            <div
              ref={wrapperScaleRef}
              style={{
                transformOrigin: "top center",
                transform: `scale(${scale})`,
                marginBottom: `${1920 * (scale - 1)}px`,
              }}
            >
              <CrossfitCard
                ref={cardRef}
                data={cardData}
                variant={variant}
                bgImage={bgImage ?? undefined}
              />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏋️</div>
              <p className={styles.emptyText}>기록을 입력하고<br />순위 계산하기를 눌러주세요</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}