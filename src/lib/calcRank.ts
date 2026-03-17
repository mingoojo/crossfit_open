import { Athlete, FormInput, CrossfitData, WOD_CONFIGS, EventData } from "@/types/crossfit"

export function parseTime(timeStr : string) : number {
  const s = timeStr.trim()
  if (s.includes(":")) {
    const [m, sec] = s.split(":").map(Number)
    return m * 60 + sec
  }
  return Number(s) || 0
}

export function calcScore(reps : number, elapsedSeconds : number, timecap : number) : number {
  const remaining = Math.max(0, timecap - elapsedSeconds)
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
  const total = athletes.length
  const wodKeys = ["wod1", "wod2", "wod3"] as const

  let overallMyScore = 0

  const events : EventData[] = WOD_CONFIGS.map((cfg, i) => {
    const wodInput = input[wodKeys[i]]
    const { reps, time } = wodInput
    const isFinished = reps >= cfg.maxReps

    const elapsed = isFinished
      ? (parseTime(time) || cfg.timecap)
      : cfg.timecap

    const myScore = calcScore(reps, elapsed, cfg.timecap)

    const wodRank = Math.min(
      athletes.filter(a => getAthleteScore(a, cfg.ordinal) > myScore).length + 1,
      total
    )
    overallMyScore += wodRank

    const pct = parseFloat(((wodRank / total) * 100).toFixed(1))

    return {
      id: cfg.id,
      name: cfg.name,
      rank: wodRank,
      pct,
      myReps: reps,
      myTime: isFinished ? (time || `${Math.floor(cfg.timecap / 60)}:${String(cfg.timecap % 60).padStart(2, "0")}`) : "",
      isFinished,
    }
  })

  const overallRank = Math.min(
    athletes.filter(a => getOverallScore(a) < overallMyScore).length + 1,
    total
  )
  const overallPct = parseFloat(((overallRank / total) * 100).toFixed(1))

  return {
    cardData: {
      year: "2026",
      handle: input.handle || "@athlete",
      overallRank,
      totalAthletes: total,
      events,
    },
  }
}

export async function loadAthletes() : Promise<Athlete[]> {
  const res = await fetch("/data/athletes.json")
  if (!res.ok) {
    throw new Error("athletes.json 로드 실패")
  }
  return res.json()
}