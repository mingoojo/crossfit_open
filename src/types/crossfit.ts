export interface EventData {
  id : string
  name : string
  rank : number
  pct : number
  myReps : number
  myTime : string
  isFinished : boolean
}

export interface CrossfitData {
  year : string
  handle : string
  overallRank : number
  totalAthletes : number
  events : EventData[]
}

export interface WodInput {
  reps : number
  time : string
}

export type Gender = "M" | "W"

export interface FormInput {
  handle : string
  gender : Gender
  wod1 : WodInput
  wod2 : WodInput
  wod3 : WodInput
}

export interface WodConfig {
  ordinal : number
  id : string
  name : string
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
  gender: "M",
  wod1: { reps: 0, time: "" },
  wod2: { reps: 0, time: "" },
  wod3: { reps: 0, time: "" },
}

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