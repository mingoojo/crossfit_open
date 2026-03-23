export type WodLevel = "RX" | "SCALED" | "MASTERS"
export type WodRecordType = "time" | "reps"

export interface WodFormInput {
  handle : string // 이름/닉네임
  date : string // YYYY-MM-DD
  wodName : string // WOD 이름 (e.g. "FRAN", "CINDY", "오늘의 와드")
  movements : string // 운동 내용 (줄바꿈 구분)
  recordType : WodRecordType
  recordTime : string // MM:SS or H:MM:SS (time일 때)
  recordReps : number // reps일 때
  level : WodLevel
}

export const DEFAULT_WOD_INPUT : WodFormInput = {
  handle: "",
  date: new Date().toISOString().slice(0, 10),
  wodName: "",
  movements: "",
  recordType: "time",
  recordTime: "",
  recordReps: 0,
  level: "RX",
}