"use client"
import { useEffect, useState } from "react";

type Device = "mobile" | "tablet" | "desktop" | "default"

type Demension = {
  width : number;
  height : number;
}

type WebSize = "XXL" | "XL" | "L" | "M" | "MS" | "S" | "SS" | "default"

export default function useMediaQuary() {
  const [device, setDevice] = useState<Device>("default")
  const [dimensions, setDimensions] = useState<Demension>({
    width: 0,
    height: 0,
  })
  const [webSize, setWebSize] = useState<WebSize>("default")

  useEffect(() => {
    const checkDevice = () => {
      if (window.matchMedia("(max-width: 640px)").matches) {
        setDevice("mobile")
      } else if (window.matchMedia("(min-width: 641px) and (max-width: 1024px)").matches) {
        setDevice("tablet")
      } else {
        setDevice("desktop")
      }
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    checkDevice()

    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };

  }, [])

  useEffect(() => {
    const checkWebSize = () => {
      if (dimensions !== null) {
        if (dimensions.width >= 1600) {
          setWebSize("XXL")
        } else if (dimensions.width >= 1200 && dimensions.width < 1600) {
          setWebSize("XL")
        } else if (dimensions.width >= 960 && dimensions.width < 1200) {
          setWebSize("L")
        } else if (dimensions.width >= 720 && dimensions.width < 960) {
          setWebSize("M")
        } else if (dimensions.width >= 560 && dimensions.width < 720) {
          setWebSize("MS")
        } else if (dimensions.width >= 400 && dimensions.width < 560) {
          setWebSize("S")
        } else {
          setWebSize("SS")
        }
      }
    }

    checkWebSize()

    return () => {
      checkWebSize()
    }

  }, [dimensions])

  return {
    device,
    width: dimensions?.width,
    height: dimensions?.height,
    webSize,
  }
}