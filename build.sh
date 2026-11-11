#!/bin/sh
# Empacota o widget em ai-usage-meter.plasmoid (um zip com metadata.json na raiz).
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import os, zipfile
out = "ai-usage-meter.plasmoid"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk("package"):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for f in files:
            if not f.endswith(".pyc"):
                p = os.path.join(root, f)
                z.write(p, os.path.relpath(p, "package"))
print(out, "criado")
PY
