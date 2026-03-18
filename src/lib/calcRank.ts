import { Athlete, FormInput, CrossfitData, WOD_CONFIGS, EventData } from "@/types/crossfit"

// 공식 전체 참가자 수 (API pagination.totalCompetitors 기준)
export const TOTAL_COMPETITORS = {
  M: 127115,
  W: 106000, // 여성 데이터 확인 후 수정
}

export function parseTime(timeStr : string) : number {
  const s = timeStr.trim()
  if (s.includes(":")) {
    const [m, sec] = s.split(":").map(Number)
    return m * 60 + sec
  }
  return Number(s) || 0
}


export interface RankResult {
  cardData : CrossfitData
  debugInfo : object // ← 추가
}
/**
 * score = reps * 10000 + (timecap - tiebreak)
 *
 * - 완주: tiebreak = 완주 시간
 * - 미완주: tiebreak = 마지막 동작 완료 시간
 *   (타임캡까지 아무것도 못했으면 tiebreak = timecap → remaining = 0)
 */
export function calcScore(reps : number, tiebreakSeconds : number, timecap : number) : number {
  const remaining = Math.max(0, timecap - tiebreakSeconds)
  return reps * 10000 + remaining
}

function getAthleteScore(athlete : Athlete, ordinal : number) : number {
  const s = athlete.scores?.find(s => s.ordinal === ordinal && s.valid === "1")
  return s ? parseInt(s.score, 10) || 0 : 0
}

function getOverallScore(athlete : Athlete) : number {
  return parseInt(athlete.overallScore, 10) || 9999999
}

export interface RankResult {
  cardData : CrossfitData
}

export function calcRank(athletes : Athlete[], input : FormInput) : RankResult {

  const datasetSize = athletes.length
  const officialTotal = TOTAL_COMPETITORS[input.gender]
  // 데이터셋이 전체보다 작을 경우 보정 비율
  const scaleRatio = officialTotal / datasetSize

  const wodKeys = ["wod1", "wod2", "wod3"] as const

  let myOverallScore = 0

  const events : EventData[] = WOD_CONFIGS.map((cfg, i) => {
    const wodInput = input[wodKeys[i]]
    const { reps, time } = wodInput
    const isFinished = reps >= cfg.maxReps

    // tiebreak: 완주 시간 or 마지막 동작 완료 시간
    // 입력 없으면 타임캡 (remaining = 0)
    const tiebreak = parseTime(time) || cfg.timecap

    const myScore = calcScore(reps, tiebreak, cfg.timecap)

    // 데이터셋 내 WOD 순위
    const wodRankInDataset = Math.min(
      athletes.filter(a => getAthleteScore(a, cfg.ordinal) > myScore).length + 1,
      datasetSize
    )

    // 전체 참가자 기준으로 보정
    const wodRank = Math.round(wodRankInDataset * scaleRatio)
    myOverallScore += wodRank

    // 퍼센타일은 공식 전체 기준
    const pct = parseFloat(((wodRank / officialTotal) * 100).toFixed(1))

    return {
      id: cfg.id,
      name: cfg.name,
      rank: wodRank,
      pct,
      myReps: reps,
      myTime: isFinished
        ? (time || `${Math.floor(cfg.timecap / 60)}:${String(cfg.timecap % 60).padStart(2, "0")}`)
        : (time || ""),
      isFinished,
    }
  })

  // 종합 순위: 공식 overallScore와 비교
  const overallRankInDataset = Math.min(
    athletes.filter(a => {
      const officialScore = getOverallScore(a)
      return officialScore !== 9999999 && officialScore < myOverallScore
    }).length + 1,
    datasetSize
  )

  // 전체 기준 보정
  const overallRank = Math.round(overallRankInDataset * scaleRatio)
  const overallPct = parseFloat(((overallRank / officialTotal) * 100).toFixed(1))

  const debugInfo = {
    overallRank: String(overallRank),
    overallScore: String(myOverallScore),
    entrant: {
      competitorName: input.handle,
      gender: input.gender,
    },
    scores: events.map((ev, i) => {
      const cfg = WOD_CONFIGS[i]
      const wod = input[wodKeys[i]]
      const tiebreak = parseTime(wod.time) || cfg.timecap
      const myScore = calcScore(wod.reps, tiebreak, cfg.timecap)
      return {
        ordinal: i + 1,
        rank: String(ev.rank),
        score: String(myScore),
        scoreDisplay: ev.isFinished
          ? `${wod.time}`
          : `${wod.reps} reps`,
        myReps: wod.reps,
        tiebreak: wod.time || "없음",
        pct: ev.pct,
      }
    }),
  }

  return {
    cardData: {
      year: "2026",
      handle: input.handle || "@athlete",
      overallRank,
      totalAthletes: officialTotal, // 공식 전체 참가자 수 표시
      events,
    },
    debugInfo,

  }
}

export async function loadAthletes(gender : "M" | "W" = "M") : Promise<Athlete[]> {
  const file = gender === "W" ? "/data/athletes__woman.json" : "/data/athletes__man.json"
  const res = await fetch(file, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`${file} 로드 실패`)
  }
  return res.json()
}