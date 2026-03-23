"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export function useCardScale() {
  const [scale, setScale] = useState(0.24)
  const roRef = useRef<ResizeObserver | null>(null)

  const calc = useCallback((el : HTMLDivElement) => {
    const { clientWidth: cw, clientHeight: ch } = el
    if (cw === 0 || ch === 0) {
      return
    }
    const scaleX = (cw - 48) / 1080
    const scaleY = (ch - 48) / 1920
    setScale(Math.min(scaleX, scaleY))
  }, [])

  // callback ref — div가 실제로 DOM에 붙는 순간 호출됨
  const wrapperRef = useCallback((node : HTMLDivElement | null) => {
    // 이전 observer 정리
    if (roRef.current) {
      roRef.current.disconnect()
      roRef.current = null
    }

    if (!node) {
      return
    }

    // node가 DOM에 붙은 직후 계산
    requestAnimationFrame(() => {
      requestAnimationFrame(() => calc(node))
    })

    // resize 감지
    const ro = new ResizeObserver(() => calc(node))
    ro.observe(node)
    roRef.current = ro
  }, [calc])

  return { wrapperRef, scale }
}