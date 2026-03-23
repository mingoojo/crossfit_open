export interface ProgramWod {
  name : string // WOD 이름
  category : string // "For Time" | "AMRAP 20min" 등
  timecap ?: number // 초 단위 (없으면 타임캡 없음)
  movements : string // 줄바꿈 구분
}

export interface ProgramFormInput {
  date : string // YYYY-MM-DD (캘린더에서 선택)
  handle : string // 이름/닉네임
  level : "RX" | "SCALED" | "MASTERS"
  recordType : "time" | "reps" | "sets" // ← "sets" 추가
  recordTime : string // MM:SS
  recordReps : number
  recordSets : number // ← 추가
  recordSetReps : number // ← 추가
}

export const DEFAULT_PROGRAM_INPUT : ProgramFormInput = {
  date: new Date().toISOString().slice(0, 10),
  handle: "",
  level: "RX",
  recordType: "time",
  recordTime: "",
  recordReps: 0,
  recordSets: 0, // ← 추가
  recordSetReps: 0, // ← 추가
}