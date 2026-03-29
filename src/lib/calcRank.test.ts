import { Athlete, FormInput } from "@/types/crossfit"
import { calcRank } from "./calcRank"

// ── mock 데이터 ──
const mockAthletes : Athlete[] = [
  {
    overallRank: "1",
    overallScore: "100",
    scores: [
      { ordinal: 1, rank: "1", score: "3540000", valid: "1" }, // ← rank 추가
      { ordinal: 2, rank: "1", score: "1320000", valid: "1" },
      { ordinal: 3, rank: "1", score: "2880000", valid: "1" },
    ],
  },
  {
    overallRank: "2",
    overallScore: "200",
    scores: [
      { ordinal: 1, rank: "2", score: "2000000", valid: "1" },
      { ordinal: 2, rank: "2", score: "1000000", valid: "1" },
      { ordinal: 3, rank: "2", score: "1500000", valid: "1" },
    ],
  },
  {
    overallRank: "9999",
    overallScore: "9999999",
    scores: [],
  },
]

const formInput : FormInput = {
  handle: "민구",
  gender: "M",
  wod1: { reps: 354, time: "10:00" }, // 완주 (maxReps=354)
  wod2: { reps: 100, time: "05:00" }, // 미완주
  wod3: { reps: 288, time: "16:00" }, // 완주 (maxReps=288)
}


// ── 테스트 ──
describe("calcRank", () => {
  it("결과에 cardData가 존재해야 한다", () => {
    const result = calcRank(mockAthletes, formInput)
    console.log(result)
    expect(result.cardData).toBeDefined()
  })

  it("overallRank는 1 이상이어야 한다", () => {
    const result = calcRank(mockAthletes, formInput)
    expect(result.cardData.overallRank).toBeGreaterThanOrEqual(1)
  })

  it("events가 3개여야 한다", () => {
    const result = calcRank(mockAthletes, formInput)
    expect(result.cardData.events).toHaveLength(3)
  })

  it("완주한 WOD는 isFinished가 true여야 한다", () => {
    const result = calcRank(mockAthletes, formInput)
    expect(result.cardData.events[0].isFinished).toBe(true) // wod1 완주
    expect(result.cardData.events[1].isFinished).toBe(false) // wod2 미완주
  })

  it("퍼센타일은 0~100 사이여야 한다", () => {
    const result = calcRank(mockAthletes, formInput)
    result.cardData.events.forEach((ev) => {
      expect(ev.pct).toBeGreaterThanOrEqual(0)
      expect(ev.pct).toBeLessThanOrEqual(100)
    })
  })

  it("handle이 카드에 반영되어야 한다", () => {
    const result = calcRank(mockAthletes, formInput)
    expect(result.cardData.handle).toBe("민구")
  })
})