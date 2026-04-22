import json

with open("crossfit_data/athletes_m_0319.json", encoding="utf-8") as f:
    athletes = json.load(f)

slim = []
for a in athletes:
    slim.append({
        "overallScore": a.get("overallScore", ""),
        "scores": [
            {
                "ordinal": s["ordinal"],
                "score": s["score"],
                "valid": s["valid"],
            }
            for s in a.get("scores", [])
            if s.get("valid") == "1"
        ]
    })

with open("crossfit_data/athletes_m_0319_re.json", "w", encoding="utf-8") as f:
    json.dump(slim, f, separators=(",", ":"))

print(f"완료: {len(slim)}명")