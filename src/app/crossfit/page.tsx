"use client"

import { useRef, useState, useCallback } from "react"
import { CrossfitData, FormInput, DEFAULT_FORM_INPUT } from "@/types/crossfit"
import { WodFormInput, DEFAULT_WOD_INPUT } from "@/types/wod"
import { ProgramFormInput, ProgramWod, DEFAULT_PROGRAM_INPUT } from "@/types/program"
import { useCardScale } from "@/hooks/useCardScale"
import { loadAthletes, calcRank } from "@/lib/calcRank"
import CrossfitForm from "@/components/CrossfitForm"
import CrossfitCard, { CardVariant } from "@/components/CrossfitCard"
import WodForm from "@/components/WodForm"
import WodCard from "@/components/WodCard"
import ProgramForm from "@/components/ProgramForm"
import ProgramCard from "@/components/ProgramCard"
import ImageCropModal from "@/components/ImageCropModal"
import styles from "./crossfit.module.css"

type PageMode = "select" | "open" | "wod" | "program"
type MobileTab = "form" | "preview"

const VARIANTS : { id : CardVariant; label : string; color : string }[] = [
  { id: 1, label: "Dark", color: "#ff4500" },
  { id: 2, label: "White", color: "#999999" },
  { id: 3, label: "Navy", color: "#00c8ff" },
  { id: 4, label: "Forest", color: "#00e676" },
  { id: 5, label: "Photo", color: "#e0c97f" },
]

const FontSizeSlider = ({ value, onChange } : {
  value : number
  onChange : (v : number) => void
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="range"
        min={18}
        max={120}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 120,
          appearance: "none",
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(to right, #ff4500 0%, #ff4500 ${((value - 18) / (120 - 18)) * 100}%, rgba(255,255,255,0.1) ${((value - 18) / (120 - 18)) * 100}%, rgba(255,255,255,0.1) 100%)`,
          outline: "none",
          cursor: "pointer",
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#555", minWidth: 24, textAlign: "center" }}>
        {value}
      </span>
    </div>
  </div>
)

const SaveIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

export default function CrossfitPage() {
  const [mode, setMode] = useState<PageMode>("select")

  // ── Open ──
  const [formInput, setFormInput] = useState<FormInput>(DEFAULT_FORM_INPUT)
  const [cardData, setCardData] = useState<CrossfitData | null>(null)
  const [variant, setVariant] = useState<CardVariant>(1)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── WOD ──
  const [wodInput, setWodInput] = useState<WodFormInput>(DEFAULT_WOD_INPUT)
  const [wodReady, setWodReady] = useState(false)
  const [wodBgImage, setWodBgImage] = useState<string | null>(null)

  // ── Program ──
  const [programInput, setProgramInput] = useState<ProgramFormInput>(DEFAULT_PROGRAM_INPUT)
  const [programWod, setProgramWod] = useState<ProgramWod | null>(null)
  const [programReady, setProgramReady] = useState(false)
  const [programBgImage, setProgramBgImage] = useState<string | null>(null)
  const [logoVariant, setLogoVariant] = useState<"dark" | "white">("white")

  // ── 공통 ──
  const [saving, setSaving] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>("form")
  const [movementFontSize, setMovementFontSize] = useState(42)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<"open" | "wod" | "program" | null>(null)

  // ── refs ──
  const cardRef = useRef<HTMLDivElement>(null)
  const wrapperScaleRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wodCardRef = useRef<HTMLDivElement>(null)
  const wodWrapperRef2 = useRef<HTMLDivElement>(null)
  const wodFileInputRef = useRef<HTMLInputElement>(null)
  const mobileCardRef = useRef<HTMLDivElement>(null)
  const mobileWrapperScaleRef = useRef<HTMLDivElement>(null)
  const wodMobileCardRef = useRef<HTMLDivElement>(null)
  const wodMobileWrapperRef = useRef<HTMLDivElement>(null)
  const programCardRef = useRef<HTMLDivElement>(null)
  const programWrapperRef2 = useRef<HTMLDivElement>(null)
  const programFileInputRef = useRef<HTMLInputElement>(null)
  const programMobileCardRef = useRef<HTMLDivElement>(null)
  const programMobileWrapperRef = useRef<HTMLDivElement>(null)

  const { wrapperRef, scale } = useCardScale()
  const { wrapperRef: mobileWrapperRef, scale: mobileScale } = useCardScale()
  const { wrapperRef: wodWrapperRef, scale: wodScale } = useCardScale()
  const { wrapperRef: wodMobileWrapperRefScale, scale: wodMobileScale } = useCardScale()
  const { wrapperRef: programWrapperRef, scale: programScale } = useCardScale()
  const { wrapperRef: programMobileWrapperRefScale, scale: programMobileScale } = useCardScale()

  const [currentProgramWod, setCurrentProgramWod] = useState<ProgramWod | null>(null)

  // ── 폰트 드래그 ──
  const dragRef = useRef<{ startX : number; startSize : number } | null>(null)
  const handleDragStart = (e : React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    dragRef.current = { startX: clientX, startSize: movementFontSize }
  }
  const handleDragMove = (e : React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) {
      return
    }
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    setMovementFontSize(Math.min(120, Math.max(18, dragRef.current.startSize + Math.round((clientX - dragRef.current.startX) / 8))))
  }
  const handleDragEnd = () => {
    dragRef.current = null
  }

  // ── Open 계산 ──
  const handleCalc = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const athletes = await loadAthletes(formInput.gender)
      const { cardData } = calcRank(athletes, formInput)
      setCardData(cardData); setMobileTab("preview")
    } catch (err) {
      console.error(err); setError("데이터 로드 실패")
    } finally {
      setLoading(false)
    }
  }, [formInput])

  const handleWodCalc = useCallback(() => {
    setWodReady(true); setMobileTab("preview")
  }, [])

  const handleProgramCalc = useCallback((wod : ProgramWod) => {
    setProgramWod(wod); setProgramReady(true); setMobileTab("preview")
  }, [])

  // ── 사진 업로드 ──
  const makePhotoHandlers = (target : "open" | "wod" | "program") => ({
    onUpload: (e : React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        return
      }
      setCropSrc(URL.createObjectURL(file)); setCropTarget(target)
    },
    onDrop: (e : React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (!file || !file.type.startsWith("image/")) {
        return
      }
      setCropSrc(URL.createObjectURL(file)); setCropTarget(target)
    },
  })
  const openPhoto = makePhotoHandlers("open")
  const wodPhoto = makePhotoHandlers("wod")
  const programPhoto = makePhotoHandlers("program")

  const handleCropComplete = (croppedUrl : string) => {
    if (cropTarget === "open") {
      setBgImage(croppedUrl)
    }
    if (cropTarget === "wod") {
      setWodBgImage(croppedUrl)
    }
    if (cropTarget === "program") {
      setProgramBgImage(croppedUrl)
    }
    setCropSrc(null); setCropTarget(null)
  }

  // ── 저장 ──
  const handleSave = useCallback(async (
    cRef : React.RefObject<HTMLDivElement>,
    wRef : React.RefObject<HTMLDivElement>,
    filename : string
  ) => {
    if (!cRef.current || !wRef.current || saving) {
      return
    }
    setSaving(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const wrapper = wRef.current
      const prev = wrapper.style.transform; const prevM = wrapper.style.marginBottom
      wrapper.style.transform = "none"; wrapper.style.marginBottom = "0"
      const canvas = await html2canvas(cRef.current, { width: 1080, height: 1920, scale: 4, useCORS: true, allowTaint: true, backgroundColor: "#0a0a0a", logging: false })
      wrapper.style.transform = prev; wrapper.style.marginBottom = prevM
      const link = document.createElement("a"); link.download = filename; link.href = canvas.toDataURL("image/png"); link.click()
    } catch (err) {
      console.error(err); alert("이미지 저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }, [saving])

  const CropModal = () => cropSrc ? (
    <ImageCropModal src={cropSrc} onComplete={handleCropComplete} onCancel={() => {
      setCropSrc(null); setCropTarget(null)
    }} />
  ) : null

  // ══════════════════════════════════════════
  // 선택 화면
  // ══════════════════════════════════════════
  if (mode === "select") {
    return (
      <div className={styles.selectPage}>
        <CropModal />
        <div className={styles.selectHeader}>
          <div className={styles.selectTitle}>없다. 앱이름 ㅠ</div>
        </div>
        <div className={styles.selectCards}>
          <button className={styles.selectCard} onClick={() => setMode("open")}>
            <div className={styles.selectCardBadge} style={{ background: "rgba(255,69,0,0.15)", color: "#ff4500", borderColor: "rgba(255,69,0,0.3)" }}>2026 Open</div>
            <div className={styles.selectCardTitle}>2026 Open <br /> 기록 확인</div>
            <div className={styles.selectCardDesc}>CrossFit Open 2026 <br /> 성적을 확인</div>
            <div className={styles.selectCardArrow}>→</div>
          </button>
          <button className={styles.selectCard} onClick={() => setMode("wod")}>
            <div className={styles.selectCardBadge} style={{ background: "rgba(0,200,255,0.1)", color: "#00c8ff", borderColor: "rgba(0,200,255,0.3)" }}>Daily WOD</div>
            <div className={styles.selectCardTitle}>오늘의 WOD 기록하기</div>
            <div className={styles.selectCardDesc}>오늘 한 운동 기록</div>
            <div className={styles.selectCardArrow}>→</div>
          </button>
          <button className={styles.selectCard} onClick={() => setMode("program")}>
            <div className={styles.selectCardBadge} style={{ background: "rgba(0,230,118,0.1)", color: "#00e676", borderColor: "rgba(0,230,118,0.3)" }}>Weekly</div>
            <div className={styles.selectCardTitle}>CROSSFIT FAIRY </div>
            <div className={styles.selectCardDesc}>박스 운동 일정 확인 및 <br />내 기록</div>
            <div className={styles.selectCardArrow}>→</div>
          </button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // WOD 카드
  // ══════════════════════════════════════════
  if (mode === "wod") {
    return (
      <div className={styles.page}>
        <CropModal />
        <button className={styles.backBtn} onClick={() => {
          setMode("select"); setWodReady(false)
        }}>← 뒤로</button>

        <aside className={styles.formPanel}>
          <div className={styles.formHeader}>
            <p className={styles.formSubtitle}>Daily WOD</p>
            <h1 className={styles.formTitle}>오늘운동 기록하기</h1>
          </div>
          <div className={styles.formScroll}>
            <WodForm input={wodInput} onChange={setWodInput} onCalc={handleWodCalc} />
          </div>
        </aside>

        <main className={styles.previewPanel}>
          <div className={styles.wodPhotoBar} onDragOver={(e) => e.preventDefault()} onDrop={wodPhoto.onDrop} onClick={() => wodFileInputRef.current?.click()}>
            <input ref={wodFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={wodPhoto.onUpload} />
            {wodBgImage ? (<><div className={styles.photoThumb} style={{ backgroundImage: `url(${wodBgImage})` }} /><span className={styles.photoUploadText}>사진 변경</span><button className={styles.photoRemoveBtn} onClick={(e) => {
              e.stopPropagation(); setWodBgImage(null)
            }}>✕</button></>) : (<span className={styles.photoUploadText}>📷 배경 사진 업로드 (클릭 또는 드래그)</span>)}
          </div>
          <div className={styles.previewMeta}>
            {wodReady && <button className={`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ""}`} onClick={() => handleSave(wodCardRef, wodWrapperRef2, `wod_${wodInput.date}.png`)} disabled={saving}><SaveIcon />{saving ? "저장 중..." : "이미지 저장"}</button>}
            <FontSizeSlider value={movementFontSize} onChange={setMovementFontSize} />
          </div>
          <div ref={wodWrapperRef} className={styles.cardWrapper}>
            {wodReady ? (
              <div ref={wodWrapperRef2} style={{ transformOrigin: "top center", transform: `scale(${wodScale})`, marginBottom: `${1920 * (wodScale - 1)}px` }}>
                <WodCard ref={wodCardRef} data={wodInput} bgImage={wodBgImage ?? undefined} movementFontSize={movementFontSize} />
              </div>
            ) : (
              <div className={styles.emptyState}><div className={styles.emptyIcon}>🏋️</div><p className={styles.emptyText}>왼쪽에서 기록을 입력하고<br />카드 만들기를 눌러주세요</p></div>
            )}
          </div>
        </main>

        <div className={styles.mobileTabs}>
          <button className={`${styles.mobileTab} ${mobileTab === "form" ? styles.mobileTabActive : ""}`} onClick={() => setMobileTab("form")}>✏️ 입력</button>
          <button className={`${styles.mobileTab} ${mobileTab === "preview" ? styles.mobileTabActive : ""}`} onClick={() => setMobileTab("preview")}>🖼️ 미리보기</button>
        </div>
        <div className={styles.mobileTabContent}>
          {mobileTab === "form" && (
            <div className={styles.mobileFormPanel}>
              <div className={styles.mobileFormHeader}><p className={styles.mobileFormSubtitle}>Daily WOD</p><h1 className={styles.mobileFormTitle}>오늘운동 기록하기</h1></div>
              <div className={styles.mobileFormScroll}><WodForm input={wodInput} onChange={setWodInput} onCalc={handleWodCalc} hideCalcBtn /></div>
            </div>
          )}
          {mobileTab === "preview" && (
            <div className={styles.mobilePreviewPanel}>
              <div className={styles.mobilePhotoBar} onDragOver={(e) => e.preventDefault()} onDrop={wodPhoto.onDrop} onClick={() => wodFileInputRef.current?.click()}>
                {wodBgImage ? <span className={styles.photoUploadText}>사진 변경</span> : <span className={styles.photoUploadText}>📷 배경 사진 업로드</span>}
              </div>
              <div style={{ padding: "8px 16px" }}><FontSizeSlider value={movementFontSize} onChange={setMovementFontSize} /></div>
              <div ref={wodMobileWrapperRefScale} className={styles.mobileCardWrapper}>
                {wodReady ? (
                  <div ref={wodMobileWrapperRef} style={{ transformOrigin: "top center", transform: `scale(${wodMobileScale})`, marginBottom: `${1920 * (wodMobileScale - 1)}px` }}>
                    <WodCard ref={wodMobileCardRef} data={wodInput} bgImage={wodBgImage ?? undefined} movementFontSize={movementFontSize} />
                  </div>
                ) : (
                  <div className={styles.mobileEmptyState}><div className={styles.mobileEmptyIcon}>🏋️</div><p className={styles.mobileEmptyText}>입력 탭에서<br />기록을 먼저 입력해주세요</p></div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.mobileFooter}>
          {mobileTab === "form"
            ? <button className={styles.mobileCalcBtn} onClick={handleWodCalc} disabled={!wodInput.handle || !wodInput.wodName}>🏋️ 카드 만들기</button>
            : <button className={`${styles.mobileSaveBtn} ${saving ? styles.saveBtnLoading : ""}`} onClick={() => handleSave(wodMobileCardRef, wodMobileWrapperRef, `wod_${wodInput.date}.png`)} disabled={saving || !wodReady}>{saving ? "저장 중..." : "이미지 저장"}</button>
          }
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // 주간 프로그램 카드
  // ══════════════════════════════════════════
  if (mode === "program") {
    return (
      <div className={styles.page}>
        <CropModal />
        <button className={styles.backBtn} onClick={() => {
          setMode("select"); setProgramReady(false)
        }}>← 뒤로</button>

        <aside className={styles.formPanel}>
          <div className={styles.formHeader}>
            <p className={styles.formSubtitle}>CROSSFIT FAIRY</p>
            <h1 className={styles.formTitle}>운동 기록</h1>
          </div>
          <div className={styles.formScroll}>
            <ProgramForm input={programInput} onChange={setProgramInput} onCalc={handleProgramCalc} onWodChange={setCurrentProgramWod} />
          </div>
        </aside>

        <main className={styles.previewPanel}>
          <div
            className={`${styles.wodPhotoBar} ${!programBgImage ? "photoBarPulse" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={programPhoto.onDrop}
            onClick={() => programFileInputRef.current?.click()}
          >
            <input ref={programFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={programPhoto.onUpload} />
            {programBgImage ? (<><div className={styles.photoThumb} style={{ backgroundImage: `url(${programBgImage})` }} /><span className={styles.photoUploadText}>사진 변경</span><button className={styles.photoRemoveBtn} onClick={(e) => {
              e.stopPropagation(); setProgramBgImage(null)
            }}>✕</button></>) : (<span className={styles.photoUploadText}>📷 배경 사진 업로드 (클릭 또는 드래그)</span>)}
          </div>

          <div className={styles.previewMeta}>
            {programReady && <button className={`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ""}`} onClick={() => handleSave(programCardRef, programWrapperRef2, `program_${programInput.date}.png`)} disabled={saving}><SaveIcon />{saving ? "저장 중..." : "이미지 저장"}</button>}
            <div style={{ display: "flex" }}>
              <div
                onClick={() => setLogoVariant(v => v === "dark" ? "white" : "dark")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  overflow: "hidden",
                  cursor: "pointer",
                  userSelect: "none",
                  marginRight: "20px",
                }}
              >
                <div style={{
                  padding: "6px 14px",
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  background: logoVariant === "dark" ? "#fff" : "transparent",
                  color: logoVariant === "dark" ? "#000" : "#333",
                  transition: "all 0.15s",
                }}>
                B.LOGO
                </div>
                <div style={{
                  padding: "6px 14px",
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  background: logoVariant === "white" ? "#fff" : "transparent",
                  color: logoVariant === "white" ? "#000" : "#333",
                  transition: "all 0.15s",
                }}>
                W.LOGO
                </div>
              </div>
              <FontSizeSlider value={movementFontSize} onChange={setMovementFontSize} />
            </div>
          </div>
          <div ref={programWrapperRef} className={styles.cardWrapper}>
            {programReady && programWod ? (
              <div ref={programWrapperRef2} style={{ transformOrigin: "top center", transform: `scale(${programScale})`, marginBottom: `${1920 * (programScale - 1)}px` }}>
                <ProgramCard
                  ref={programCardRef}
                  input={programInput}
                  wod={programWod}
                  bgImage={programBgImage ?? undefined}
                  movementFontSize={movementFontSize}
                  logoSrc={logoVariant === "white" ? "/images/box_logo_white.png" : "/images/box_logo.png"}
                  logoVariant={logoVariant} // ← 추가
                />
              </div>
            ) : (
              <div className={styles.emptyState}><div className={styles.emptyIcon}>📅</div><p className={styles.emptyText}>날짜를 선택하고<br />카드 만들기를 눌러주세요</p></div>
            )}
          </div>
        </main>

        <div className={styles.mobileTabs}>
          <button className={`${styles.mobileTab} ${mobileTab === "form" ? styles.mobileTabActive : ""}`} onClick={() => setMobileTab("form")}>✏️ 입력</button>
          <button className={`${styles.mobileTab} ${mobileTab === "preview" ? styles.mobileTabActive : ""}`} onClick={() => setMobileTab("preview")}>🖼️ 미리보기</button>
        </div>
        <div className={styles.mobileTabContent}>
          {mobileTab === "form" && (
            <div className={styles.mobileFormPanel}>
              <div className={styles.mobileFormHeader}><p className={styles.mobileFormSubtitle}>CROSSFIT FAIRY</p><h1 className={styles.mobileFormTitle}>카드 만들기</h1></div>
              <div className={styles.mobileFormScroll}><ProgramForm input={programInput} onChange={setProgramInput} onCalc={handleProgramCalc} hideCalcBtn onWodChange={setCurrentProgramWod} /></div>
            </div>
          )}
          {mobileTab === "preview" && (
            <div className={styles.mobilePreviewPanel}>
              <div
                className={`${styles.mobilePhotoBar} ${!programBgImage ? "photoBarPulse" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={programPhoto.onDrop}
                onClick={() => programFileInputRef.current?.click()}
              >
                {programBgImage ? <span className={styles.photoUploadText}>사진 변경</span> : <span className={styles.photoUploadText}>📷 배경 사진 업로드</span>}
              </div>
              <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between" }}>
                <div
                  onClick={() => setLogoVariant(v => v === "dark" ? "white" : "dark")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 4,
                    overflow: "hidden",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{
                    padding: "6px 14px",
                    fontSize: 11, fontWeight: 700, letterSpacing: 2,
                    background: logoVariant === "dark" ? "#fff" : "transparent",
                    color: logoVariant === "dark" ? "#000" : "#333",
                    transition: "all 0.15s",
                  }}>
                    B.LOGO
                  </div>
                  <div style={{
                    padding: "6px 14px",
                    fontSize: 11, fontWeight: 700, letterSpacing: 2,
                    background: logoVariant === "white" ? "#fff" : "transparent",
                    color: logoVariant === "white" ? "#000" : "#333",
                    transition: "all 0.15s",
                  }}>
                    W.LOGO
                  </div>
                </div>
                <FontSizeSlider value={movementFontSize} onChange={setMovementFontSize} />
              </div>
              <div ref={programMobileWrapperRefScale} className={styles.mobileCardWrapper}>
                {programReady && programWod ? (
                  <div ref={programMobileWrapperRef} style={{ transformOrigin: "top center", transform: `scale(${programMobileScale})`, marginBottom: `${1920 * (programMobileScale - 1)}px` }}>
                    <ProgramCard
                      ref={programMobileCardRef}
                      input={programInput}
                      wod={programWod}
                      bgImage={programBgImage ?? undefined}
                      movementFontSize={movementFontSize}
                      logoSrc={logoVariant === "white" ? "/images/box_logo_white.png" : "/images/box_logo.png"}
                      logoVariant={logoVariant} // ← 추가
                    />
                  </div>
                ) : (
                  <div className={styles.mobileEmptyState}><div className={styles.mobileEmptyIcon}>📅</div><p className={styles.mobileEmptyText}>입력 탭에서<br />날짜를 먼저 선택해주세요</p></div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.mobileFooter}>
          {mobileTab === "form"
            ? <button
              className={styles.mobileCalcBtn}
              onClick={() => currentProgramWod && handleProgramCalc(currentProgramWod)}
              disabled={!programInput.handle || !currentProgramWod}>📅 카드 만들기</button>
            : <button className={`${styles.mobileSaveBtn} ${saving ? styles.saveBtnLoading : ""}`} onClick={() => handleSave(programMobileCardRef, programMobileWrapperRef, `program_${programInput.date}.png`)} disabled={saving || !programReady}>{saving ? "저장 중..." : "이미지 저장"}</button>
          }
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // Open 카드
  // ══════════════════════════════════════════
  return (
    <div className={styles.page}>
      <CropModal />
      <button className={styles.backBtn} onClick={() => {
        setMode("select"); setCardData(null)
      }}>← 뒤로</button>

      <aside className={styles.formPanel}>
        <div className={styles.formHeader}>
          <p className={styles.formSubtitle}>CrossFit Open 2026</p>
          <h1 className={styles.formTitle}>2026 OPEN 기록 확인</h1>
        </div>
        <div className={styles.formScroll}>
          <CrossfitForm input={formInput} onChange={setFormInput} onCalc={handleCalc} loading={loading} />
          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
      </aside>

      <main className={styles.previewPanel}>
        <div className={styles.previewMeta}>
          <div className={styles.variantToggle}>
            {VARIANTS.map((v) => (
              <button key={v.id} className={`${styles.variantBtn} ${variant === v.id ? styles.variantBtnActive : ""}`} style={{ "--v-color": v.color } as React.CSSProperties} onClick={() => setVariant(v.id)}>
                <span className={styles.variantDot} />{v.label}
              </button>
            ))}
          </div>
          {cardData && <button className={`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ""}`} onClick={() => handleSave(cardRef, wrapperScaleRef, `crossfit_open_2026_style${variant}.png`)} disabled={saving}><SaveIcon />{saving ? "저장 중..." : "이미지 저장"}</button>}
        </div>

        {variant === 5 && (
          <div className={styles.photoUploadBar} onDragOver={(e) => e.preventDefault()} onDrop={openPhoto.onDrop} onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={openPhoto.onUpload} />
            {bgImage ? (<><div className={styles.photoThumb} style={{ backgroundImage: `url(${bgImage})` }} /><span className={styles.photoUploadText}>사진 변경</span><button className={styles.photoRemoveBtn} onClick={(e) => {
              e.stopPropagation(); setBgImage(null)
            }}>✕</button></>) : (<span className={styles.photoUploadText}>사진 업로드 (클릭 또는 드래그)</span>)}
          </div>
        )}

        <div ref={wrapperRef} className={styles.cardWrapper}>
          {cardData ? (
            <div ref={wrapperScaleRef} style={{ transformOrigin: "top center", transform: `scale(${scale})`, marginBottom: `${1920 * (scale - 1)}px` }}>
              <CrossfitCard ref={cardRef} data={cardData} variant={variant} bgImage={bgImage ?? undefined} />
            </div>
          ) : (
            <div className={styles.emptyState}><div className={styles.emptyIcon}>🏋️</div><p className={styles.emptyText}>기록을 입력하고<br />순위 계산하기를 눌러주세요</p></div>
          )}
        </div>
      </main>

      <div className={styles.mobileTabs}>
        <button className={`${styles.mobileTab} ${mobileTab === "form" ? styles.mobileTabActive : ""}`} onClick={() => setMobileTab("form")}>✏️ 입력</button>
        <button className={`${styles.mobileTab} ${mobileTab === "preview" ? styles.mobileTabActive : ""}`} onClick={() => setMobileTab("preview")}>🖼️ 미리보기</button>
      </div>
      <div className={styles.mobileTabContent}>
        {mobileTab === "form" && (
          <div className={styles.mobileFormPanel}>
            <div className={styles.mobileFormHeader}><p className={styles.mobileFormSubtitle}>CrossFit Open 2026</p><h1 className={styles.mobileFormTitle}>
              2026 OPEN 기록 확인</h1></div>
            <div className={styles.mobileFormScroll}>
              <CrossfitForm input={formInput} onChange={setFormInput} onCalc={handleCalc} loading={loading} />
              {error && <p className={styles.errorMsg}>{error}</p>}
            </div>
          </div>
        )}
        {mobileTab === "preview" && (
          <div className={styles.mobilePreviewPanel}>
            <div className={styles.mobilePreviewTop}>
              <div className={styles.mobileVariantToggle}>
                {VARIANTS.map((v) => (
                  <button key={v.id} className={`${styles.mobileVariantBtn} ${variant === v.id ? styles.mobileVariantBtnActive : ""}`} style={{ "--v-color": v.color } as React.CSSProperties} onClick={() => setVariant(v.id)}>
                    <span className={styles.variantDot} style={{ width: 6, height: 6 }} />{v.label}
                  </button>
                ))}
              </div>
            </div>
            <div ref={mobileWrapperRef} className={styles.mobileCardWrapper}>
              {cardData ? (
                <div ref={mobileWrapperScaleRef} style={{ transformOrigin: "top center", transform: `scale(${mobileScale})`, marginBottom: `${1920 * (mobileScale - 1)}px` }}>
                  <CrossfitCard ref={mobileCardRef} data={cardData} variant={variant} bgImage={bgImage ?? undefined} />
                </div>
              ) : (
                <div className={styles.mobileEmptyState}><div className={styles.mobileEmptyIcon}>🏋️</div><p className={styles.mobileEmptyText}>입력 탭에서<br />기록을 먼저 입력해주세요</p></div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={styles.mobileFooter}>
        {mobileTab === "form"
          ? <button className={styles.mobileCalcBtn} onClick={handleCalc} disabled={loading || !formInput.handle}>{loading ? "계산 중..." : "🏆 순위 계산하기"}</button>
          : <button className={`${styles.mobileSaveBtn} ${saving ? styles.saveBtnLoading : ""}`} onClick={() => handleSave(mobileCardRef, mobileWrapperScaleRef, `crossfit_open_2026_style${variant}.png`)} disabled={saving || !cardData}>{saving ? "저장 중..." : "이미지 저장"}</button>
        }
      </div>
    </div>
  )
}