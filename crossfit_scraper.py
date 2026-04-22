"""
CrossFit Open 2026 Leaderboard Scraper
- 남자/여자 RXD 각각 수집 → athletes_m_rxd.json / athletes_f_rxd.json
- 총 페이지 수를 API 첫 응답에서 동적으로 가져옴
- 체크포인트 기반 재시작 지원
- atomic write로 파일 깨짐 방지
"""

import requests
import json
import time
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# ─────────────────────────────────────────
# 설정
# ─────────────────────────────────────────
BASE_URL = "https://c3po.crossfit.com/api/leaderboards/v2/competitions/open/2026/leaderboards"

DIVISIONS = [
    {"name": "남자 RXD", "division": 1, "scaled": 0, "suffix": "m_rxd"},
    {"name": "여자 RXD", "division": 2, "scaled": 0, "suffix": "f_rxd"},
]

DELAY_SEC   = 0.5
MAX_RETRIES = 5
RETRY_DELAY = 5

OUTPUT_DIR = Path("crossfit_data")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/json",
}

# ─────────────────────────────────────────
# 체크포인트
# ─────────────────────────────────────────

def checkpoint_file(suffix: str) -> Path:
    return OUTPUT_DIR / f"checkpoint_{suffix}.json"

def output_file(suffix: str) -> Path:
    return OUTPUT_DIR / f"athletes_{suffix}.json"

def temp_file(suffix: str) -> Path:
    return OUTPUT_DIR / f"athletes_{suffix}.tmp.json"

def load_checkpoint(suffix: str):
    cf = checkpoint_file(suffix)
    if cf.exists():
        with open(cf) as f:
            data = json.load(f)
            return data.get("last_page", 0), data.get("total_athletes", 0)
    return 0, 0

def save_checkpoint(suffix: str, page: int, total: int):
    with open(checkpoint_file(suffix), "w") as f:
        json.dump({"last_page": page, "total_athletes": total}, f)

# ─────────────────────────────────────────
# 안전한 파일 저장 (atomic write)
# ─────────────────────────────────────────

def safe_save(suffix: str, data: list):
    tf = temp_file(suffix)
    with open(tf, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    os.replace(tf, output_file(suffix))

def safe_load(suffix: str) -> list:
    of = output_file(suffix)
    if not of.exists():
        return []
    try:
        with open(of, encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"⚠ {of.name} 파일 손상 → 처음부터 다시 수집합니다.")
        of.unlink()
        cf = checkpoint_file(suffix)
        if cf.exists():
            cf.unlink()
        return []

# ─────────────────────────────────────────
# API 요청
# ─────────────────────────────────────────

def fetch_page(session: requests.Session, params: dict, page: int):
    """(rows, total_pages) 반환. total_pages는 첫 페이지 응답에서만 유효."""
    req_params = {**params, "page": page}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.get(BASE_URL, params=req_params, headers=HEADERS, timeout=15)

            if resp.status_code == 200:
                body = resp.json()
                rows = body.get("leaderboardRows", [])
                total_pages = body.get("pagination", {}).get("totalPages", None)
                return rows, total_pages

            elif resp.status_code == 429:
                wait = RETRY_DELAY * attempt
                print(f"  [429] Rate limited → {wait}초 대기")
                time.sleep(wait)

            elif resp.status_code in (500, 502, 503):
                print(f"  [{resp.status_code}] 서버 오류 → 재시도 {attempt}/{MAX_RETRIES}")
                time.sleep(RETRY_DELAY)

            else:
                print(f"  [!] 상태코드 {resp.status_code} → 건너뜀")
                return [], None

        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            print(f"  [오류] {e} → 재시도 {attempt}/{MAX_RETRIES}")
            time.sleep(RETRY_DELAY * attempt)

    print(f"  [실패] 페이지 {page} 건너뜀")
    return [], None

# ─────────────────────────────────────────
# division 단위 수집
# ─────────────────────────────────────────

def scrape_division(session: requests.Session, division: int, scaled: int, name: str, suffix: str):
    print(f"\n{'='*50}")
    print(f"▶ {name} 수집 시작")
    print(f"{'='*50}")

    base_params = {"view": 0, "division": division, "region": 0, "scaled": scaled, "sort": 0}

    last_page, _ = load_checkpoint(suffix)
    start_page = last_page + 1
    all_athletes = safe_load(suffix)

    if not all_athletes and last_page > 0:
        last_page = 0
        start_page = 1

    # 총 페이지 수를 API 첫 응답에서 동적으로 가져옴
    total_pages = None
    if start_page == 1:
        _, total_pages = fetch_page(session, base_params, 1)
        if total_pages is None:
            print("  [!] totalPages를 가져오지 못했습니다. 수집을 건너뜁니다.")
            return
        print(f"  총 페이지 수: {total_pages:,}")
    else:
        # 이어서 시작할 때도 첫 페이지로 확인
        _, total_pages = fetch_page(session, base_params, 1)
        if total_pages is None:
            print("  [!] totalPages를 가져오지 못했습니다. 수집을 건너뜁니다.")
            return
        print(f"  이어서 시작: page {start_page} / {total_pages:,} (기존 {len(all_athletes):,}명)")

    start_time = time.time()
    pages_done_before = last_page  # 이어서 시작할 때 이미 완료된 페이지 수

    try:
        for page in range(start_page, total_pages + 1):
            rows, _ = fetch_page(session, base_params, page)
            all_athletes.extend(rows)

            safe_save(suffix, all_athletes)
            save_checkpoint(suffix, page, len(all_athletes))

            if page % 50 == 0 or page == total_pages:
                pct = page / total_pages * 100
                elapsed_sec = time.time() - start_time
                pages_this_run = page - pages_done_before
                pages_left = total_pages - page
                sec_per_page = elapsed_sec / pages_this_run if pages_this_run > 0 else 0
                eta_sec = sec_per_page * pages_left
                eta_str = (datetime.now() + timedelta(seconds=eta_sec)).strftime("%H:%M:%S")
                elapsed_str = str(timedelta(seconds=int(elapsed_sec)))
                print(f"  [{pct:5.1f}%] page {page:,}/{total_pages:,} | 누적 {len(all_athletes):,}명 | 경과 {elapsed_str} | 예상 완료 {eta_str}")

            time.sleep(DELAY_SEC)

    except KeyboardInterrupt:
        print(f"\n⏸ 중단 — 체크포인트 저장됨 (page {page}, {len(all_athletes):,}명)")
        sys.exit(0)

    print(f"\n✅ {name} 완료! 총 {len(all_athletes):,}명 → {output_file(suffix)}")

# ─────────────────────────────────────────
# 메인
# ─────────────────────────────────────────

def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    session = requests.Session()

    for div in DIVISIONS:
        scrape_division(
            session=session,
            division=div["division"],
            scaled=div["scaled"],
            name=div["name"],
            suffix=div["suffix"],
        )

    print("\n🎉 모든 수집 완료!")
    for div in DIVISIONS:
        of = output_file(div["suffix"])
        if of.exists():
            data = json.loads(of.read_text(encoding="utf-8"))
            print(f"  {div['name']}: {len(data):,}명 → {of}")


if __name__ == "__main__":
    main()
