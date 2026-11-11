#!/usr/bin/env python3
"""Imprime em JSON o consumo do plano (Claude Code), para o widget do Plasma."""
import json
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

CREDS = Path.home() / ".claude" / ".credentials.json"
URL = "https://api.anthropic.com/api/oauth/usage"


def epoch_ms(iso):
    return int(datetime.fromisoformat(iso).timestamp() * 1000) if iso else 0


def main():
    try:
        token = json.loads(CREDS.read_text())["claudeAiOauth"]["accessToken"]
    except Exception:
        return {"ok": False, "error": "login"}
    req = urllib.request.Request(URL, headers={
        "Authorization": f"Bearer {token}",
        "anthropic-beta": "oauth-2025-04-20",
        "User-Agent": "ai-usage-meter",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": "expired" if e.code == 401 else f"http:{e.code}"}
    except Exception:
        return {"ok": False, "error": "offline"}

    fh, sd = data.get("five_hour") or {}, data.get("seven_day") or {}
    scoped = []
    for l in data.get("limits") or []:
        if l.get("kind") == "weekly_scoped" and l.get("scope"):
            name = ((l["scope"].get("model") or {}).get("display_name")) or "modelo"
            scoped.append({"name": name, "used": float(l.get("percent") or 0)})
    return {
        "ok": True,
        "session": {"used": float(fh.get("utilization") or 0),
                    "resets": epoch_ms(fh.get("resets_at"))},
        "weekly": {"used": float(sd.get("utilization") or 0),
                   "resets": epoch_ms(sd.get("resets_at"))},
        "scoped": scoped,
    }


if __name__ == "__main__":
    print(json.dumps(main()))
