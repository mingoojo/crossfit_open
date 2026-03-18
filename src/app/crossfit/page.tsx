"use client"

import { useRef, useState, useCallback } from "react"
import { CrossfitData, FormInput, DEFAULT_FORM_INPUT } from "@/types/crossfit"
import { useCardScale } from "@/hooks/useCardScale"
import { loadAthletes, calcRank } from "@/lib/calcRank"
import CrossfitForm from "@/components/CrossfitForm"
import CrossfitCard, { CardVariant } from "@/components/CrossfitCard"
import styles from "./crossfit.module.css"

const VARIANTS : { id : CardVariant; label : string; color : string }[] = [
  { id: 1, label: "Dark", color: "#ff4500" },
  { id: 2, label: "White", color: "#999999" },
  { id: 3, label: "Navy", color: "#00c8ff" },
  { id: 4, label: "Forest", color: "#00e676" },
  { id: 5, label: "Photo", color: "#e0c97f" },
]

type MobileTab = "form" | "preview"

export default function CrossfitPage() {
  const [formInput, setFormInput] = useState<FormInput>(DEFAULT_FORM_INPUT)
  const [cardData, setCardData] = useState<CrossfitData | null>(null)
  const [variant, setVariant] = useState<CardVariant>(1)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>("form")

  const cardRef = useRef<HTMLDivElement>(null)
  const wrapperScaleRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { wrapperRef, scale } = useCardScale()

  // ── 모바일용 카드 스케일 ──
  const { wrapperRef: mobileWrapperRef, scale: mobileScale } = useCardScale()
  const mobileWrapperScaleRef = useRef<HTMLDivElement>(null)
  const mobileCardRef = useRef<HTMLDivElement>(null)

  // ── 순위 계산 ──
  const handleCalc = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const athletes = await loadAthletes(formInput.gender)
      const { cardData } = calcRank(athletes, formInput)
      setCardData(cardData)
      setMobileTab("preview") // 모바일: 계산 후 자동으로 미리보기 탭 이동
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
    if (bgImage?.startsWith("blob:")) {
      URL.revokeObjectURL(bgImage)
    }
    setBgImage(URL.createObjectURL(file))
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
  const handleSave = useCallback(async (
    cRef : React.RefObject<HTMLDivElement>,
    wRef : React.RefObject<HTMLDivElement>
  ) => {
    if (!cRef.current || !wRef.current || saving || !cardData) {
      return
    }
    setSaving(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const wrapper = wRef.current
      const prev = wrapper.style.transform
      const prevMargin = wrapper.style.marginBottom
      wrapper.style.transform = "none"
      wrapper.style.marginBottom = "0"

      const canvas = await html2canvas(cRef.current, {
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

  // ── 카드 프리뷰 공통 컴포넌트 ──
  const CardPreview = ({
    wRef,
    scaleVal,
    cRef,
    wScaleRef,
  } : {
    wRef : React.RefObject<HTMLDivElement>
    scaleVal : number
    cRef : React.RefObject<HTMLDivElement>
    wScaleRef : React.RefObject<HTMLDivElement>
  }) => (
    <div ref={wRef} className={styles.cardWrapper} style={{ flex: 1, overflow: "hidden",
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px" }}>
      {cardData ? (
        <div
          ref={wScaleRef}
          style={{
            transformOrigin: "top center",
            transform: `scale(${scaleVal})`,
            marginBottom: `${1920 * (scaleVal - 1)}px`,
          }}
        >
          <CrossfitCard
            ref={cRef}
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
  )

  // ── 사진 업로드 바 공통 ──
  const PhotoBar = ({ mobile = false } : { mobile ?: boolean }) => (
    variant === 5 ? (
      <div
        className={mobile ? styles.mobilePhotoBar : styles.photoUploadBar}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handlePhotoDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*"
          style={{ display: "none" }} onChange={handlePhotoUpload} />
        {bgImage ? (
          <>
            <div className={styles.photoThumb}
              style={{ backgroundImage: `url(${bgImage})` }} />
            <span className={styles.photoUploadText}>사진 변경</span>
            <button className={styles.photoRemoveBtn}
              onClick={(e) => {
                e.stopPropagation(); setBgImage(null)
              }}>✕</button>
          </>
        ) : (
          <>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
              strokeLinejoin="round" style={{ opacity: 0.4, flexShrink: 0 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className={styles.photoUploadText}>사진 업로드 (클릭 또는 드래그)</span>
          </>
        )}
      </div>
    ) : null
  )

  return (
    <div className={styles.page}>
      {/* ════════════════════════════
          데스크탑 레이아웃
      ════════════════════════════ */}
      {/* 왼쪽: 폼 */}
      <aside className={styles.formPanel}>
        <div className={styles.formHeader}>
          <p className={styles.formSubtitle}>CrossFit Open 2026</p>
          <h1 className={styles.formTitle}>카드 만들기</h1>
        </div>
        <div className={styles.formScroll}>
          <CrossfitForm input={formInput} onChange={setFormInput}
            onCalc={handleCalc} loading={loading} />
          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
      </aside>

      {/* 오른쪽: 프리뷰 */}
      <main className={styles.previewPanel}>
        <div className={styles.previewMeta}>
          <div className={styles.variantToggle}>
            {VARIANTS.map((v) => (
              <button key={v.id}
                className={`${styles.variantBtn} ${variant === v.id ? styles.variantBtnActive : ""}`}
                style={{ "--v-color": v.color } as React.CSSProperties}
                onClick={() => setVariant(v.id)}>
                <span className={styles.variantDot} />
                {v.label}
              </button>
            ))}
          </div>
          {cardData && (
            <button
              className={`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ""}`}
              onClick={() => handleSave(cardRef, wrapperScaleRef)}
              disabled={saving}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {saving ? "저장 중..." : "이미지 저장"}
            </button>
          )}
        </div>

        <PhotoBar />

        <div ref={wrapperRef} className={styles.cardWrapper}>
          {cardData ? (
            <div ref={wrapperScaleRef} style={{
              transformOrigin: "top center",
              transform: `scale(${scale})`,
              marginBottom: `${1920 * (scale - 1)}px`,
            }}>
              <CrossfitCard ref={cardRef} data={cardData}
                variant={variant} bgImage={bgImage ?? undefined} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏋️</div>
              <p className={styles.emptyText}>기록을 입력하고<br />순위 계산하기를 눌러주세요</p>
            </div>
          )}
        </div>
      </main>

      {/* ════════════════════════════
          모바일 레이아웃
      ════════════════════════════ */}
      {/* 탭 바 */}
      <div className={styles.mobileTabs}>
        <button
          className={`${styles.mobileTab} ${mobileTab === "form" ? styles.mobileTabActive : ""}`}
          onClick={() => setMobileTab("form")}>
          ✏️ 입력
        </button>
        <button
          className={`${styles.mobileTab} ${mobileTab === "preview" ? styles.mobileTabActive : ""}`}
          onClick={() => setMobileTab("preview")}>
          🖼️ 미리보기
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className={styles.mobileTabContent}>
        {/* 입력 탭 */}
        {mobileTab === "form" && (
          <div className={styles.mobileFormPanel}>
            <div className={styles.mobileFormHeader}>
              <p className={styles.mobileFormSubtitle}>CrossFit Open 2026</p>
              <h1 className={styles.mobileFormTitle}>카드 만들기</h1>
            </div>
            <div className={styles.mobileFormScroll}>
              <CrossfitForm input={formInput} onChange={setFormInput}
                onCalc={handleCalc} loading={loading} />
              {error && <p className={styles.errorMsg}>{error}</p>}
            </div>
          </div>
        )}

        {/* 미리보기 탭 */}
        {mobileTab === "preview" && (
          <div className={styles.mobilePreviewPanel}>
            {/* 스타일 토글 + 사진 업로드 */}
            <div className={styles.mobilePreviewTop}>
              <div className={styles.mobileVariantToggle}>
                {VARIANTS.map((v) => (
                  <button key={v.id}
                    className={`${styles.mobileVariantBtn} ${variant === v.id ? styles.mobileVariantBtnActive : ""}`}
                    style={{ "--v-color": v.color } as React.CSSProperties}
                    onClick={() => setVariant(v.id)}>
                    <span className={styles.variantDot} style={{ width: 6, height: 6 }} />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <PhotoBar mobile />

            {/* 카드 프리뷰 */}
            <div ref={mobileWrapperRef} className={styles.mobileCardWrapper}>
              {cardData ? (
                <div ref={mobileWrapperScaleRef} style={{
                  transformOrigin: "top center",
                  transform: `scale(${mobileScale})`,
                  marginBottom: `${1920 * (mobileScale - 1)}px`,
                }}>
                  <CrossfitCard ref={mobileCardRef} data={cardData}
                    variant={variant} bgImage={bgImage ?? undefined} />
                </div>
              ) : (
                <div className={styles.mobileEmptyState}>
                  <div className={styles.mobileEmptyIcon}>🏋️</div>
                  <p className={styles.mobileEmptyText}>입력 탭에서<br />기록을 먼저 입력해주세요</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 모바일 하단 고정 버튼 */}
      <div className={styles.mobileFooter}>
        {mobileTab === "form" ? (
          <button
            className={styles.mobileCalcBtn}
            onClick={handleCalc}
            disabled={loading || !formInput.handle}>
            {loading ? "계산 중..." : "🏆 순위 계산하기"}
          </button>
        ) : (
          <button
            className={`${styles.mobileSaveBtn} ${saving ? styles.saveBtnLoading : ""}`}
            onClick={() => handleSave(mobileCardRef, mobileWrapperScaleRef)}
            disabled={saving || !cardData}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {saving ? "저장 중..." : "이미지 저장"}
          </button>
        )}
      </div>
    </div>
  )
}