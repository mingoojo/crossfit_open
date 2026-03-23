"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface Props {
  src : string
  onComplete : (croppedUrl : string) => void
  onCancel : () => void
}

const ASPECT = 9 / 16
const MIN_CROP_PX = 200

function centerAspectCrop(mediaWidth : number, mediaHeight : number, aspect : number) : Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCropModal({ src, onComplete, onCancel } : Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  const onImageLoad = useCallback((e : React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, ASPECT))
  }, [])

  const handleConfirm = useCallback(async () => {
    const image = imgRef.current
    if (!image || !completedCrop) {
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const canvas = document.createElement("canvas")
    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob((blob) => {
      if (!blob) {
        return
      }
      onComplete(URL.createObjectURL(blob))
    }, "image/png")
  }, [completedCrop, onComplete])

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.9)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 20, padding: 24,
    }}>

      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 16, fontWeight: 700, letterSpacing: 4,
        color: "#888", textTransform: "uppercase",
      }}>
        배경 영역 선택
      </div>

      <div style={{
        maxWidth: "min(480px, 90vw)",
        maxHeight: "70vh",
        overflow: "auto",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={ASPECT}
          minWidth={MIN_CROP_PX}
          minHeight={MIN_CROP_PX / ASPECT}
          keepSelection
        >
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            onLoad={onImageLoad}
            style={{ maxWidth: "100%", display: "block" }}
          />
        </ReactCrop>
      </div>

      <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, textAlign: "center" }}>
        드래그로 영역 선택 · 비율 9:16 고정
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 28px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 4, color: "#666",
            fontSize: 13, fontWeight: 600, letterSpacing: 2,
            cursor: "pointer",
          }}
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          disabled={!completedCrop}
          style={{
            padding: "10px 28px",
            background: "linear-gradient(135deg, #ff4500, #ff8c00)",
            border: "none", borderRadius: 4, color: "#fff",
            fontSize: 13, fontWeight: 700, letterSpacing: 2,
            cursor: completedCrop ? "pointer" : "not-allowed",
            opacity: completedCrop ? 1 : 0.4,
          }}
        >
          적용
        </button>
      </div>
    </div>
  )
}