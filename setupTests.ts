// ──────────────────────────────────────────────────────────────
// setupTests.ts
// jest.config.js의 setupFilesAfterEnv에 등록된 파일.
// 모든 테스트 파일 실행 전에 딱 한 번 실행되는 전역 설정.
// ──────────────────────────────────────────────────────────────

// @testing-library/jest-dom의 커스텀 matcher를 Jest에 추가.
// 이걸 import해야 아래 같은 DOM 전용 matcher를 쓸 수 있음:
//   expect(element).toBeVisible()
//   expect(element).toHaveTextContent("hello")
//   expect(element).toBeInTheDocument()
// 없으면 "toBeVisible is not a function" 같은 에러 발생.
import "@testing-library/jest-dom"

// ──────────────────────────────────────────────────────────────
// window.matchMedia 폴리필
// ──────────────────────────────────────────────────────────────
// 문제: Jest의 테스트 환경(jsdom)은 실제 브라우저가 아니라서
//       window.matchMedia 가 존재하지 않음.
//       CSS 미디어쿼리(@media)를 쓰는 컴포넌트를 테스트하면
//       "window.matchMedia is not a function" 에러 발생.
//
// 해결: 가짜(mock) matchMedia를 window에 주입해서 에러를 막음.
//       실제 미디어쿼리 동작은 하지 않고 기본값(matches: false)만 반환.
Object.defineProperty(window, "matchMedia", {
  writable: true, // 나중에 다시 덮어쓸 수 있게 허용
  value: jest.fn().mockImplementation((query) => ({
    matches: false, // 미디어쿼리가 매칭되는지 여부. 기본 false (모바일 아님으로 설정)
    media: query, // 전달받은 쿼리 문자열 그대로 반환 ex) "(max-width: 768px)"
    onchange: null, // 미디어쿼리 변경 이벤트 핸들러 (사용 안 함)
    addListener: jest.fn(), // deprecated된 구버전 API. 에러 안 나게 빈 함수로 대체
    removeListener: jest.fn(), // deprecated된 구버전 API. 에러 안 나게 빈 함수로 대체
    addEventListener: jest.fn(), // 현재 표준 API. 에러 안 나게 빈 함수로 대체
    removeEventListener: jest.fn(), // 현재 표준 API. 에러 안 나게 빈 함수로 대체
    dispatchEvent: jest.fn(), // 이벤트 수동 발생. 에러 안 나게 빈 함수로 대체
  })),
})