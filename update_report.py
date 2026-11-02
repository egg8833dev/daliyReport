import json, os, re, sys, tempfile
from datetime import datetime
from zoneinfo import ZoneInfo

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.join(BASE_DIR, "public", "reports")
MANIFEST_PATH = os.path.join(REPORTS_DIR, "manifest.json")

REQUIRED = ['## 📰','## 💹','## 🔬','## 🖥','## ⚙','## 💱','## 🧮','## 🏗','## 🤖','## 🔍','## ✍','## 🧰','## 📖','## 📅','## 💼','## 🌟','## 📝']

QUALITY_PROFILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "report_quality.json")


def taiwan_now():
    return datetime.now(ZoneInfo("Asia/Taipei"))


def load_quality_profile(path=QUALITY_PROFILE_PATH):
    with open(path, "r", encoding="utf-8") as f:
        profile = json.load(f)

    global_rules = profile.get("global", {})
    required_global_rules = ("min_utf8_bytes", "min_unique_urls", "min_action_markers")
    missing = [key for key in required_global_rules if key not in global_rules]
    if missing or not profile.get("sections"):
        raise ValueError("invalid quality profile: missing " + ", ".join(missing or ["sections"]))
    return profile


URL_RE = re.compile(r"https?://[^\s)>\]]+")
FENCED_CODE_RE = re.compile(r"```.*?```", re.DOTALL)
ACTION_MARKERS = ("【影響】", "【行動建議】", "【實戰連結】")


def safe_print(message):
    try:
        print(message)
    except UnicodeEncodeError:
        print(message.encode("ascii", "backslashreplace").decode("ascii"))


def _section_text(content, icon):
    starts = [content.find(prefix) for prefix in REQUIRED]
    start = content.find("## " + icon)
    if start < 0:
        return ""
    following = [position for position in starts if position > start]
    end = min(following) if following else len(content)
    return content[start:end]


def _unique_editorial_urls(content):
    prose_only = FENCED_CODE_RE.sub("", content)
    return set(URL_RE.findall(prose_only))


def validate_quality(content, profile):
    errors = []
    global_rules = profile["global"]
    utf8_bytes = len(content.encode("utf-8"))
    if utf8_bytes < global_rules["min_utf8_bytes"]:
        errors.append(
            "min_utf8_bytes: {0} < {1}".format(utf8_bytes, global_rules["min_utf8_bytes"])
        )

    unique_urls = _unique_editorial_urls(content)
    if len(unique_urls) < global_rules["min_unique_urls"]:
        errors.append(
            "unique URLs: {0} < {1}".format(len(unique_urls), global_rules["min_unique_urls"])
        )

    action_count = sum(content.count(marker) for marker in ACTION_MARKERS)
    if action_count < global_rules["min_action_markers"]:
        errors.append(
            "action markers: {0} < {1}".format(action_count, global_rules["min_action_markers"])
        )

    for icon, rules in profile["sections"].items():
        section = _section_text(content, icon)
        char_count = len(section)
        if char_count < rules.get("min_chars", 0):
            errors.append("section {0} chars: {1} < {2}".format(icon, char_count, rules["min_chars"]))

        url_count = len(_unique_editorial_urls(section))
        if url_count < rules.get("min_urls", 0):
            errors.append("section {0} URLs: {1} < {2}".format(icon, url_count, rules["min_urls"]))

        if rules.get("requires_deep_analysis") and "🔎 深度解析" not in section:
            errors.append("section {0} requires 🔎 深度解析".format(icon))
        if rules.get("requires_code") and "```" not in section:
            errors.append("section {0} requires a code block".format(icon))
        if rules.get("requires_practical_marker") and not any(marker in section for marker in ACTION_MARKERS):
            errors.append("section {0} requires an action or practical marker".format(icon))
        phrase = rules.get("requires_phrase")
        if phrase and phrase.lower() not in section.lower():
            errors.append("section {0} requires phrase: {1}".format(icon, phrase))

    return errors

def validate(content):
    missing = [s for s in REQUIRED if s not in content]
    if missing:
        print("validation failed, missing: " + ", ".join(missing))
        return False
    return True


def check_quality(content):
    if not validate(content):
        return False
    quality_errors = validate_quality(content, load_quality_profile())
    if quality_errors:
        safe_print("quality validation failed:")
        for error in quality_errors:
            safe_print("- " + error)
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
    if not check_quality(content):
        sys.exit(1)
    now = taiwan_now()
    today = now.strftime("%Y-%m-%d")
    gen_at = now.strftime("%Y-%m-%d %H:%M") + " (Taiwan time)"
    save_report(today, content, gen_at)
    update_manifest(today, gen_at)
    git_push(today)

if __name__ == "__main__":
    args = sys.argv[1:]
    check_only = args[:1] == ["--check"]
    if check_only:
        args = args[1:]
    if args:
        with open(args[0], "r", encoding="utf-8") as f:
            content = f.read()
    else:
        content = sys.stdin.read()
    if not content.strip():
        print("empty content"); sys.exit(1)
    if check_only:
        if not check_quality(content):
            sys.exit(1)
        safe_print("quality validation passed")
    else:
        update(content)
