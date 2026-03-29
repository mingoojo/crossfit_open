// ──────────────────────────────────────────────────────────────
// jest.config.js
// Jest의 전체 동작 방식을 설정하는 파일.
// "어떤 환경에서, 어떻게 파일을 변환하고, 어디서 테스트를 찾을지" 정의.
// ──────────────────────────────────────────────────────────────

module.exports = {

  // ── preset ──────────────────────────────────────────────────
  // TypeScript 파일을 Jest가 이해할 수 있도록 변환하는 기본 설정 묶음.
  // "ts-jest"를 쓰면 tsconfig.json 기반으로 TS → JS 변환이 자동으로 설정됨.
  // (아래 transform에서 @swc/jest로 덮어쓰므로 실질적으로는 fallback 역할)
  preset: "ts-jest",

  // ── testEnvironment ─────────────────────────────────────────
  // 테스트가 실행되는 가상 환경.
  // "jsdom": 브라우저 환경을 시뮬레이션. window, document, DOM API 등 사용 가능.
  //           React 컴포넌트 테스트에 필수.
  // "node": Node.js 환경. DOM 없음. 순수 함수/API 테스트에 적합.
  testEnvironment: "jsdom",

  // ── setupFilesAfterEnv ───────────────────────────────────────
  // 각 테스트 파일 실행 직전에 한 번씩 실행할 설정 파일 목록.
  // (beforeAll보다 먼저, 테스트 프레임워크 초기화 후에 실행됨)
  // setupTests.ts: jest-dom matcher 추가, matchMedia 폴리필 등 전역 설정.
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],

  // ── moduleNameMapper ─────────────────────────────────────────
  // import 경로를 테스트 환경에 맞게 변환하는 매핑 규칙.
  // 실제 파일 시스템 경로로 resolve되지 않는 경우를 처리.
  moduleNameMapper: {

    // "@/components/Button" → "<rootDir>/src/components/Button"
    // Next.js의 절대경로 alias(@/)를 Jest가 이해할 수 있게 변환.
    "^@/(.*)$": "<rootDir>/src/$1",

    // CSS Modules import 처리.
    // 테스트에서 styles.button 같은 클래스명을 그대로 문자열로 반환.
    // (실제 CSS 적용은 안 됨, 클래스명 확인용)
    // identity-obj-proxy 패키지 필요: npm install -D identity-obj-proxy
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // 이미지 파일 import 처리.
    // import logo from "./logo.png" → "test-file-stub" 문자열로 대체.
    // 테스트에서 이미지가 실제로 필요하지 않으므로 가짜 값으로 대체.
    // __mocks__/fileMock.js: module.exports = "test-file-stub"
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },

  // ── transform ────────────────────────────────────────────────
  // Jest가 파일을 읽을 때 변환(트랜스파일)하는 방법.
  // Node.js는 ESM/TypeScript/JSX를 직접 이해 못하므로 변환이 필요.
  transform: {

    // .ts, .tsx, .js, .jsx 파일을 @swc/jest로 변환.
    // @swc/jest: Rust 기반의 초고속 트랜스파일러. ts-jest보다 훨씬 빠름.
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript", // TypeScript 문법 파싱
            jsx: true, // JSX 문법 파싱 (React 컴포넌트용)
          },
          transform: {
            react: {
              runtime: "automatic", // React 17+: import React 없이 JSX 사용 가능
            },
          },
        },
      },
    ],

    // .mjs, .js, .ts, .tsx 파일을 babel-jest로도 변환.
    // 주의: 위 패턴과 겹치는 부분이 있어 충돌 가능성 있음.
    // ESM 모듈(react-image-crop 등)처리를 위한 fallback으로 사용.
    // → 실제로는 하나만 쓰는 게 권장됨. 현재는 중복 설정 상태.
    "^.+\\.(mjs|js|ts|tsx)$": "babel-jest",
  },

  // ── transformIgnorePatterns ──────────────────────────────────
  // 변환(transform)을 건너뛸 경로 패턴. (변환 안 해도 되는 파일들)
  // 기본적으로 node_modules는 이미 컴파일된 JS이므로 변환 안 함.
  // 단, ESM 형태로 배포된 패키지는 변환이 필요하므로 예외 처리.
  transformIgnorePatterns: [

    // node_modules 중 ol, color-space, react-image-crop 빼고 변환 안 함.
    // 이 세 패키지는 ESM으로 배포되어 있어 Jest가 직접 읽지 못하므로
    // 예외적으로 변환 대상에 포함시킴.
    "<rootDir>/node_modules/(?!(ol|color-space|react-image-crop)/)",

    // 중복 패턴 — 위에서 이미 처리됨. 제거해도 무방.
    "<rootDir>/node_modules/(?!(ol|color-space)/)",

    // dist 폴더는 빌드 결과물이므로 변환 불필요.
    "<rootDir>/dist/",
  ],

  // ── testPathIgnorePatterns ───────────────────────────────────
  // 테스트 파일을 찾을 때 제외할 경로 패턴.
  // 이 경로에 있는 파일은 테스트로 인식하지 않음.
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/", // 외부 패키지 테스트 파일 제외
    "<rootDir>/dist/", // 빌드 결과물 제외
  ],
}