export interface EventData {
  id : string // "26.1"
  name : string // "Wall-balls & Box Jumps"
  rank : number // 내 순위
  pct : number // 상위 X%
  myReps : number // 내가 한 reps
  myTime : string // 완주 시간 ("11:30") — maxReps 달성 시만 의미 있음
  isFinished : boolean // maxReps 달성 여부
}

export interface CrossfitData {
  year : string
  handle : string
  overallRank : number
  totalAthletes : number
  events : EventData[]
}

// ── 폼 입력 ──────────────────────────────
export interface WodInput {
  reps : number
  time : string // "11:30"
}

export interface FormInput {
  handle : string
  wod1 : WodInput
  wod2 : WodInput
  wod3 : WodInput
}

// ── WOD 설정 ─────────────────────────────
export interface WodConfig {
  ordinal : number
  id : string
  name : string // 카드에 표시할 운동 이름
  timecap : number
  maxReps : number
}

export const WOD_CONFIGS : WodConfig[] = [
  {
    ordinal: 1,
    id: "26.1",
    name: "Wall Balls & Box Jumps",
    timecap: 720,
    maxReps: 354,
  },
  {
    ordinal: 2,
    id: "26.2",
    name: "DB Lunge · Snatch · Gymnastics",
    timecap: 900,
    maxReps: 132,
  },
  {
    ordinal: 3,
    id: "26.3",
    name: "Burpees & Cleans / Thrusters",
    timecap: 960,
    maxReps: 288,
  },
]

export const DEFAULT_FORM_INPUT : FormInput = {
  handle: "",
  wod1: { reps: 0, time: "" },
  wod2: { reps: 0, time: "" },
  wod3: { reps: 0, time: "" },
}

// ── athletes.json 타입 ────────────────────
export interface AthleteScore {
  ordinal : number
  rank : string
  score : string
  valid : string
}

export interface Athlete {
  overallRank : string
  overallScore : string
  scores : AthleteScore[]
}