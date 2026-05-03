// src/app/box-info/page.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer"
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

const MAP_CENTER = { lat: 36.5, lng: 127.5 }
const BOUNDS_BUFFER = 0.3 // 뷰포트 30% 여유

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
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    background: #f97316;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    transition: transform 0.15s ease;
  `

  const label = document.createElement("span")
  label.textContent = name.replace(/crossfit\s*/gi, "").trim()
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
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["marker"],
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const boxesRef = useRef<Box[]>([]) // idle 핸들러에서 최신 boxes 접근용

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

  // boxes 변경 시 ref 동기화 + 마커 업데이트
  useEffect(() => {
    boxesRef.current = boxes
    if (mapRef.current && clustererRef.current && boxes.length > 0) {
      updateMarkers()
    }
  }, [boxes])

  // 뷰포트 기준 마커 업데이트
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !clustererRef.current || boxesRef.current.length === 0) {
      return
    }

    const bounds = mapRef.current.getBounds()
    if (!bounds) {
      return
    }

    // 뷰포트에 버퍼 추가
    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()
    const latBuf = (ne.lat() - sw.lat()) * BOUNDS_BUFFER
    const lngBuf = (ne.lng() - sw.lng()) * BOUNDS_BUFFER

    const bufferedBounds = new google.maps.LatLngBounds(
      { lat: sw.lat() - latBuf, lng: sw.lng() - lngBuf },
      { lat: ne.lat() + latBuf, lng: ne.lng() + lngBuf }
    )

    // 뷰포트 안 박스만 필터
    const visibleBoxes = boxesRef.current.filter(box =>
      bufferedBounds.contains({ lat: box.latitude, lng: box.longitude })
    )

    // 기존 마커 제거
    clustererRef.current.clearMarkers()
    markersRef.current.forEach(m => {
      m.map = null
    })


    const markers = visibleBoxes.map((box) => {
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

    markersRef.current = markers
    clustererRef.current.addMarkers(markers as any)
  }, [])

  const onMapLoad = useCallback((map : google.maps.Map) => {
    mapRef.current = map

    // 클러스터러 초기화 (마커 없이)
    clustererRef.current = new MarkerClusterer({
      map,
      algorithm: new SuperClusterAlgorithm({ maxZoom: 12, radius: 80 }),
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
          return new google.maps.marker.AdvancedMarkerElement({ position, content: div })
        },
      },
    })

    // 드래그/줌 끝나면 뷰포트 마커 업데이트
    map.addListener("idle", updateMarkers)

    // 줌 변경 시 라벨 토글
    // map.addListener("zoom_changed", () => {
    //   const zoom = map.getZoom() ?? 0
    //   const showLabel = zoom >= LABEL_ZOOM_THRESHOLD
    //   markersRef.current.forEach((marker) => {
    //     marker.content = createMarkerElement(marker.title ?? "", showLabel)
    //   })
    // })
  }, [updateMarkers])

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.mapWrapper}>
        <div className={styles.topBar}>
          <span className={styles.topBarTitle}>📍 전세계 CrossFit 박스</span>
          {!loading && <span className={styles.topBarCount}>{total.toLocaleString()}개</span>}
        </div>

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