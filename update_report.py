import glob, json, os, sys, tempfile
from datetime import datetime

_WIN_BASE = r"C:\Users\egg8833\Desktop\daliyReport"
_cands = glob.glob("/sessions/*/mnt/Desktop/daliyReport")
_BASH = _cands[0] if _cands else None
BASE_DIR = _BASH if (_BASH and os.path.exists(_BASH)) else _WIN_BASE
REPORTS_DIR = os.path.join(BASE_DIR, "public", "reports")
MANIFEST_PATH = os.path.join(REPORTS_DIR, "manifest.json")

REQUIRED = ['## 📰','## 💹','## 🔬','## 🖥','## ⚙','## 💱','## 🧮','## 🏗','## 🤖','## 🔍','## ✍','## 🧰','## 📖','## 📅','## 💼','## 🌟','## 📝']

def validate(content):
    missing = [s for s in REQUIRED if s not in content]
    if missing:
        print("validation failed, missing: " + ", ".join(missing))
        return False
    return True

def atomic_write(path, data):
    d = os.path.dirname(os.path.abspath(path))
    os.makedirs(d, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(data)
        os.replace(tmp, path)
    except OSError:
        # Some mounts (bash sandbox NTFS view) forbid rename/unlink. Fall back
        # to direct in-place write so the scheduled run still succeeds.
        with open(path, "w", encoding="utf-8") as f:
            f.write(data)
        try: os.unlink(tmp)
        except OSError: pass
    except Exception:
        try: os.unlink(tmp)
        except OSError: pass
        raise

def save_report(date, content, generated_at):
    payload = {"date": date, "generatedAt": generated_at, "content": content.strip()}
    path = os.path.join(REPORTS_DIR, date + ".json")
    atomic_write(path, json.dumps(payload, ensure_ascii=False, indent=2))
    print("saved: public/reports/" + date + ".json (" + str(round(os.path.getsize(path)/1024,1)) + " KB)")

def update_manifest(date, generated_at):
    manifest = []
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            manifest = []
    manifest = [e for e in manifest if e.get("date") != date]
    manifest.insert(0, {"date": date, "generatedAt": generated_at})
    manifest.sort(key=lambda e: e.get("date",""), reverse=True)
    atomic_write(MANIFEST_PATH, json.dumps(manifest, ensure_ascii=False, indent=2))
    print("manifest updated: " + str(len(manifest)) + " reports")
    return len(manifest)

def git_push(date):
    # Git operations are handled entirely by push_report_auto.bat on the Windows side.
    # Running git from Linux (bash sandbox) leaves .git/refs/heads/main.lock on the
    # NTFS filesystem which blocks Windows git. Do NOT run any git commands here.
    print("git push skipped - handled by Windows Task Scheduler (push_report_auto.bat at 04:45)")

def update(content):
    if not validate(content):
        sys.exit(1)
    today = datetime.now().strftime("%Y-%m-%d")
    gen_at = datetime.now().strftime("%Y-%m-%d %H:%M") + " (Taiwan time)"
    save_report(today, content, gen_at)
    update_manifest(today, gen_at)
    git_push(today)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            content = f.read()
    else:
        content = sys.stdin.read()
    if not content.strip():
        print("empty content"); sys.exit(1)
    update(content)
