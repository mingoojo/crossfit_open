// src/app/open/page.tsx
"use client"

import { useRef, useState, useCallback } from "react"
import { CrossfitData, FormInput, DEFAULT_FORM_INPUT } from "@/types/crossfit"
import { useCardScale } from "@/hooks/useCardScale"
import { loadAthletes, calcRank } from "@/lib/calcRank"
import CrossfitForm from "@/components/CrossfitForm"
import CrossfitCard, { CardVariant } from "@/components/CrossfitCard"
import ImageCropModal from "@/components/ImageCropModal"
import Header from "@/components/Header"
import styles from "./open.module.css"

const VARIANTS : { id : CardVariant; label : string; color : string }[] = [
  { id: 1, label: "Dark", color: "#ff4500" },
  { id: 2, label: "White", color: "#999999" },
  { id: 3, label: "Navy", color: "#00c8ff" },
  { id: 4, label: "Forest", color: "#00e676" },
  { id: 5, label: "Photo", color: "#e0c97f" },
]

export default function OpenPage() {
  const [formInput, setFormInput] = useState<FormInput>(DEFAULT_FORM_INPUT)
  const [cardData, setCardData] = useState<CrossfitData | null>(null)
  const [variant, setVariant] = useState<CardVariant>(1)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form")

  const cardRef = useRef<HTMLDivElement>(null)
  const wrapperScaleRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileCardRef = useRef<HTMLDivElement>(null)
  const mobileWrapperScaleRef = useRef<HTMLDivElement>(null)

  const { wrapperRef, scale } = useCardScale()
  const { wrapperRef: mobileWrapperRef, scale: mobileScale } = useCardScale()

  const handleCalc = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const athletes = await loadAthletes(formInput.gender)
      const { cardData } = calcRank(athletes, formInput)
      setCardData(cardData); setMobileTab("preview")
    } catch {
      setError("데이터 로드 실패")
    } finally {
      setLoading(false)
    }
  }, [formInput])

  const handleSave = useCallback(async () => {
    const cRef = cardRef; const wRef = wrapperScaleRef
    if (!cRef.current || !wRef.current || saving) {
      return
    }
    setSaving(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const wrapper = wRef.current
      const prev = wrapper.style.transform; const prevM = wrapper.style.marginBottom
      wrapper.style.transform = "none"; wrapper.style.marginBottom = "0"
      const canvas = await html2canvas(cRef.current, {
        width: 1080, height: 1920, scale: 4,
        useCORS: true, allowTaint: true,
        backgroundColor: "#0a0a0a", logging: false,
      })
      wrapper.style.transform = prev; wrapper.style.marginBottom = prevM
      const link = document.createElement("a")
      link.download = `crossfit_open_2026_style${variant}.png`
      link.href = canvas.toDataURL("image/png"); link.click()
    } catch {
      alert("이미지 저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }, [saving, variant])

  const onUpload = (e : React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCropSrc(URL.createObjectURL(file))
    }
  }
  const onDrop = (e : React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith("image/")) {
      setCropSrc(URL.createObjectURL(file))
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onComplete={(url) => {
            setBgImage(url); setCropSrc(null)
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* ── 히어로 배너 ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>CrossFit Open 2026</span>
            <h1 className={styles.heroTitle}>2026 OPEN<br />기록 확인</h1>
            <p className={styles.heroDesc}>핸들과 각 이벤트 기록을 입력하면<br />전체 순위와 퍼센타일을 계산해드려요</p>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>3</div>
              <div className={styles.heroStatLabel}>Events</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>Rx&apos;d</div>
              <div className={styles.heroStatLabel}>Division</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── 왼쪽 폼 패널 ── */}
        <aside className={styles.formPanel}>
          <div className={styles.formPanelHeader}>
            <p className={styles.formPanelTitle}>기록 입력</p>
            <p className={styles.formPanelSub}>성별 · 핸들 · 각 이벤트 점수</p>
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

        {/* ── 오른쪽 프리뷰 ── */}
        <main className={styles.previewPanel}>
          <div className={styles.previewControls}>
            <div className={styles.variantToggle}>
              <span className={styles.controlLabel}>테마</span>
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
                {saving ? "저장 중..." : "⬇ 이미지 저장"}
              </button>
            )}
          </div>

          {variant === 5 && (
            <div className={styles.photoBar} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onUpload} />
              {bgImage
                ? <><div className={styles.photoThumb} style={{ backgroundImage: `url(${bgImage})` }} /><span>사진 변경</span><button onClick={(e) => {
                  e.stopPropagation(); setBgImage(null)
                }}>✕</button></>
                : <span>📷 배경 사진 업로드 (클릭 또는 드래그)</span>
              }
            </div>
          )}

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
                <CrossfitCard ref={cardRef} data={cardData} variant={variant} bgImage={bgImage ?? undefined} />
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏆</div>
                <p>기록을 입력하고<br />순위 계산하기를 눌러주세요</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 모바일 탭 이하 동일 */}
    ...
    </div>
  )
}