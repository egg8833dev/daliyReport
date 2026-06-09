"""
update_report.py — 每日日報寫入工具（Vite + React 版）

用法：
  python update_report.py <report_file.md>
  python update_report.py < report.md

每次執行：
  1. 驗證七個區塊是否完整
  2. 將報告寫入 public/reports/YYYY-MM-DD.json
  3. 更新 public/reports/manifest.json
  4. 執行 git add / commit / push 到 GitHub

環境：
  - 需在專案根目錄建立 .env 檔，內含：
      GITHUB_TOKEN=ghp_your_token_here
  - TZ=Asia/Taipei（排程時請加上此環境變數確保日期正確）
"""
import glob
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime

# ── 路徑偵測（動態取得 bash session 路徑）─────────────────
_WIN_BASE = r"C:\Users\egg8833\Desktop\每日周報"

_bash_candidates = glob.glob("/sessions/*/mnt/Desktop/每日周報")
_BASH_BASE = _bash_candidates[0] if _bash_candidates else None

BASE_DIR    = _BASH_BASE if (_BASH_BASE and os.path.exists(_BASH_BASE)) else _WIN_BASE
REPORTS_DIR = os.path.join(BASE_DIR, "public", "reports")
MANIFEST_PATH = os.path.join(REPORTS_DIR, "manifest.json")
# ──────────────────────────────────────────────────────────

REQUIRED_SECTIONS = [
    '## 📰', '## 💹', '## 🔬',
    '## 🖥', '## ⚙', '## 🔍', '## 📝',
]


def validate(content):
    missing = [s for s in REQUIRED_SECTIONS if s not in content]
    if missing:
        print("❌ 驗證失敗，缺少區塊：" + ", ".join(missing))
        print("   報告未寫入，請確認搜尋結果完整後重新執行。")
        return False
    return True


def atomic_write(path, data_str):
    dir_ = os.path.dirname(os.path.abspath(path))
    os.makedirs(dir_, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=dir_, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(data_str)
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def save_report_json(date, content, generated_at):
    payload = {
        "date": date,
        "generatedAt": generated_at,
        "content": content.strip(),
    }
    report_path = os.path.join(REPORTS_DIR, date + ".json")
    atomic_write(report_path, json.dumps(payload, ensure_ascii=False, indent=2))
    size_kb = round(os.path.getsize(report_path) / 1024, 1)
    print(f"✅ 報告寫入：public/reports/{date}.json ({size_kb} KB)")


def update_manifest(date, generated_at):
    manifest = []
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except (json.JSONDecodeError, ValueError):
            print("⚠️  manifest.json 解析失敗，將重新建立")
            manifest = []

    manifest = [e for e in manifest if e.get("date") != date]
    manifest.insert(0, {"date": date, "generatedAt": generated_at})
    manifest.sort(key=lambda e: e.get("date", ""), reverse=True)

    atomic_write(MANIFEST_PATH, json.dumps(manifest, ensure_ascii=False, indent=2))
    print(f"✅ 索引更新：manifest.json（共 {len(manifest)} 份報告）")
    return len(manifest)


def load_github_token():
    env_path = os.path.join(BASE_DIR, ".env")
    if not os.path.exists(env_path):
        return None
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("GITHUB_TOKEN="):
                return line.split("=", 1)[1].strip().strip('"\'')
    return None


def git_push(date):
    def run(cmd):
        result = subprocess.run(
            cmd, cwd=BASE_DIR,
            capture_output=True, text=True
        )
        return result

    token = load_github_token()
    if not token:
        print("⚠️  未找到 GITHUB_TOKEN，略過 git push（請建立 .env 檔）")
        return

    # Set authenticated remote URL
    remote_url = f"https://{token}@github.com/egg8833dev/daliyReport.git"
    run(["git", "remote", "set-url", "origin", remote_url])

    # Ensure git identity is set
    run(["git", "config", "user.email", "daily-bot@report.local"])
    run(["git", "config", "user.name",  "Daily Report Bot"])

    # Stage only the reports folder
    r = run(["git", "add", "public/reports/"])
    if r.returncode != 0:
        print(f"❌ git add 失敗：{r.stderr.strip()}")
        return

    r = run(["git", "commit", "-m", f"📰 daily report {date}"])
    if r.returncode != 0:
        # If nothing to commit that's fine
        if "nothing to commit" in (r.stdout + r.stderr):
            print("ℹ️  無變更，略過 git push")
        else:
            print(f"❌ git commit 失敗：{r.stderr.strip()}")
        return

    r = run(["git", "push", "origin", "main"])
    if r.returncode == 0:
        print(f"✅ Git push 成功 → github.com/egg8833dev/daliyReport")
    else:
        print(f"❌ Git push 失敗：{r.stderr.strip()}")


def update(content):
    if not validate(content):
        sys.exit(1)

    today        = datetime.now().strftime("%Y-%m-%d")
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M") + " (台灣時間)"

    save_report_json(today, content.strip(), generated_at)
    total = update_manifest(today, generated_at)
    print(f"   共 {total} 份報告永久存檔於 public/reports/")

    git_push(today)
    return total


if __name__ == "__main__":
    if len(sys.argv) > 1:
        fpath = sys.argv[1]
        if not os.path.isfile(fpath):
            print("❌ 找不到檔案：" + fpath)
            sys.exit(1)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
    else:
        content = sys.stdin.read()

    if not content.strip():
        print("❌ 內容為空，請提供報告 Markdown 內容")
        sys.exit(1)

    update(content)
