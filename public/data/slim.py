import json

files = [
    ("athletes__man.json", "athletes__man_re.json"),
    ("athletes__woman.json", "athletes__woman_re.json"),
]

for input_file, output_file in files:
    with open(input_file, encoding="utf-8") as f:
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

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(slim, f, separators=(",", ":"))

    print(f"{input_file} → {output_file} 완료: {len(slim)}명")
