"use client"

import { useEffect, useRef, useState } from "react"

export function useCardScale() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.24)

  useEffect(() => {
    const CARD_W = 1080
    const CARD_H = 1920

    const calc = () => {
      if (!wrapperRef.current) {
        return
      }
      const { clientWidth: cw, clientHeight: ch } = wrapperRef.current
      const scaleX = (cw - 48) / CARD_W
      const scaleY = (ch - 48) / CARD_H
      setScale(Math.min(scaleX, scaleY))
    }

    calc()
    const ro = new ResizeObserver(calc)
    if (wrapperRef.current) {
      ro.observe(wrapperRef.current)
    }
    return () => ro.disconnect()
  }, [])

  return { wrapperRef, scale }
}