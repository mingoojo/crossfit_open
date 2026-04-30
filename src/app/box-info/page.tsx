// src/app/box-info/page.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { MarkerClusterer } from "@googlemaps/markerclusterer"
import Header from "@/components/Header"
import api from "@/lib/api"
import styles from "./boxInfo.module.css"


interface Box {
  id : number
  name : string
  address : string
  city : string
  country : string
  countryCode : string
  latitude : number
  longitude : number
  primaryImageUrl : string
  logoUrl : string
  slug : string
}

const MAP_CENTER = { lat: 36.5, lng: 127.5 } // 한국 중심
const MAP_OPTIONS = {
  mapId: "DEMO_MAP_ID",
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
  ],
}

const createMarkerElement = (name : string) => {
  const wrapper = document.createElement("div")
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    transform: translateY(20px);

  `

  const dot = document.createElement("div")
  dot.style.cssText = `
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    background: #f97316;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    transition: transform 0.15s ease;
  `

  const label = document.createElement("span")
  label.textContent = name
  label.style.cssText = `
    background: rgba(255,255,255,0.92);
    color: #111;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    pointer-events: none;
  `

  wrapper.appendChild(dot)
  wrapper.appendChild(label)

  wrapper.addEventListener("mouseenter", () => {
    dot.style.transform = "scale(1.6)"
  })
  wrapper.addEventListener("mouseleave", () => {
    dot.style.transform = "scale(1)"
  })

  return wrapper
}



export default function BoxInfoPage() {

  // 1. useJsApiLoader에 libraries 추가
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["marker"],
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)

  const [boxes, setBoxes] = useState<Box[]>([])
  const [selectedBox, setSelectedBox] = useState<Box | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchBoxes()
  }, [])

  const fetchBoxes = async () => {
    try {
      const { data } = await api.get<Box[]>("/api/boxes")
      setBoxes(data)
      setTotal(data.length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const onMapLoad = useCallback((map : google.maps.Map) => {
    mapRef.current = map
    infoWindowRef.current = new google.maps.InfoWindow()
  }, [])

  // 박스 데이터 & 맵 둘 다 준비됐을 때 마커 생성
  useEffect(() => {
    if (!mapRef.current || boxes.length === 0) {
      return
    }

    clustererRef.current?.clearMarkers()
    markersRef.current.forEach(m => m.map = null)

    const markers = boxes.map((box) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: box.latitude, lng: box.longitude },
        content: createMarkerElement(box.name),
        title: box.name,
      })

      marker.addListener("click", () => {
        setSelectedBox(box)
        mapRef.current?.panTo({ lat: box.latitude, lng: box.longitude })
      })

      return marker
    })

    markersRef.current = markers as any
    clustererRef.current = new MarkerClusterer({
      map: mapRef.current,
      markers: markers as any,
      renderer: {
        render: ({ count, position }) => {
          const div = document.createElement("div")
          div.style.cssText = `
          background: #111;
          color: #fff;
          border: 2px solid #f97316;
          border-radius: 50%;
          width: ${count > 100 ? 48 : count > 10 ? 40 : 32}px;
          height: ${count > 100 ? 48 : count > 10 ? 40 : 32}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${count > 100 ? 13 : 11}px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `
          div.textContent = count > 999 ? "999+" : String(count)

          return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: div,
          })
        },
      },
    })
  }, [boxes, mapRef.current])

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.mapWrapper}>
        {/* 상단 바 */}
        <div className={styles.topBar}>
          <span className={styles.topBarTitle}>📍 전세계 CrossFit 박스</span>
          {!loading && <span className={styles.topBarCount}>{total.toLocaleString()}개</span>}
        </div>

        {/* 지도 */}
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName={styles.map}
            center={MAP_CENTER}
            zoom={7}
            options={MAP_OPTIONS}
            onLoad={onMapLoad}
          />
        ) : (
          <div className={styles.mapLoading}>지도 불러오는 중...</div>
        )}

        {/* 선택된 박스 정보 패널 */}
        {selectedBox && (
          <div className={styles.infoPanel}>
            <button className={styles.infoPanelClose} onClick={() => setSelectedBox(null)}>✕</button>
            {selectedBox.primaryImageUrl && (
              <img
                src={selectedBox.primaryImageUrl}
                alt={selectedBox.name}
                className={styles.infoPanelImage}
              />
            )}
            <div className={styles.infoPanelBody}>
              <h3 className={styles.infoPanelName}>{selectedBox.name}</h3>
              <p className={styles.infoPanelAddr}>{selectedBox.address}</p>
              <p className={styles.infoPanelCity}>{selectedBox.city}{selectedBox.country ? `, ${selectedBox.country}` : ""}</p>
              <a
                href={`https://www.crossfit.com${selectedBox.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.infoPanelLink}
              >
                CrossFit 공식 페이지 →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}