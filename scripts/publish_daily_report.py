"""Validate a generated report, then write only its dated JSON and manifest.

Git commit/push is deliberately performed by the caller after tests pass.
"""
import argparse
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
import json
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from update_report import load_quality_profile, validate_quality

HEADINGS = [
    '## 📰 一、國際與台灣重要新聞', '## 💹 二、財經與股市資訊',
    '## 🔬 三、科技與技術新知', '## 🖥️ 四、前端 / UI UX / 網頁設計',
    '## ⚙️ 五、後端 / 資安 / 維運 / CI/CD', '## 💱 六、金融科技與交易系統',
    '## 🧮 七、演算法', '## 🏗️ 八、系統設計', '## 🤖 九、AI 工程與工作流實戰',
    '## 🔍 十、SEO 知識與內容優化建議', '## ✍️ 十一、技術寫作與個人品牌',
    '## 🧰 十二、開發者效率工具', '## 📖 十三、深讀計畫',
    '## 📅 十四、歷史脈絡|鑑往知今', '## 💼 十五、職涯規劃與職場發展',
    '## 🌟 十六、心靈勵志與成功學', '## 📝 十七、今日發文素材推薦',
]


def validate(content):
    actual = re.findall(r'^## .+$', content, re.M)
    if actual != HEADINGS:
        raise ValueError('Report must contain all 17 exact headings in order')
    for key in ('algo-progress', 'sysdesign-progress', 'ai-progress', 'deep-read', 'used', 'backend-progress'):
        if not re.search(r'<!--\s*' + key + r':\s*\S.+?-->', content, re.S):
            raise ValueError('Missing progress: ' + key)
    sections = re.split(r'^## .+$', content, flags=re.M)[1:]
    for heading, section in zip(HEADINGS, sections):
        if len(section.strip()) < 150 or '📌 今日重點' not in section:
            raise ValueError('Missing section content or takeaway: ' + heading)
    if '僅供參考' not in sections[1] or '台灣時間' not in sections[1]:
        raise ValueError('Financial section needs timestamp and investment notice')
    if not re.findall(r'\]\((https?://[^\s)]+)\)', content):
        raise ValueError('No source links')
    quality_errors = validate_quality(content, load_quality_profile())
    if quality_errors:
        raise ValueError('quality validation failed:\n- ' + '\n- '.join(quality_errors))


def verify_code(content):
    blocks = re.findall(r'^```(?:javascript|js)\s*\n(.*?)^```', content, re.M | re.S)
    if len(blocks) < 3:
        raise ValueError('Need runnable JavaScript examples for algorithm, system design and AI')
    for number, block in enumerate(blocks, 1):
        result = subprocess.run(['node', '--input-type=module'], input=block, text=True,
                                capture_output=True, timeout=30)
        if result.returncode:
            raise ValueError(f'JavaScript block {number} failed:\n{result.stderr}')
        print(f'JavaScript block {number}: {result.stdout.strip()}')


def verify_links(content):
    urls = sorted(set(re.findall(r'\]\((https?://[^\s)]+)\)', content)))

    def check(url):
        try:
            request = Request(url, headers={'User-Agent': 'DailyReport-LinkCheck/1.0'})
            with urlopen(request, timeout=25) as response:
                if response.status >= 400:
                    return url
        except Exception:
            return url
        return None

    with ThreadPoolExecutor(max_workers=6) as pool:
        failed = [url for url in pool.map(check, urls) if url]
    if failed:
        raise ValueError('Unverified links; fix or replace with source name (no direct link):\n' + '\n'.join(failed))
    print(f'External links verified: {len(urls)}')


def write_report(content, target_date, reports_dir, generated_at):
    # Parse existing state before writing anything; never discard a damaged index.
    manifest_path = reports_dir / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    if not isinstance(manifest, list) or any(not isinstance(m, dict) or 'date' not in m for m in manifest):
        raise ValueError('Invalid existing manifest')
    payload = {'date': target_date, 'generatedAt': generated_at, 'content': content.strip()}
    manifest = [m for m in manifest if m['date'] != target_date]
    manifest.append({'date': target_date, 'generatedAt': generated_at})
    manifest.sort(key=lambda m: m['date'], reverse=True)
    for path, data in [(reports_dir / f'{target_date}.json', payload), (manifest_path, manifest)]:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=reports_dir, delete=False) as stream:
            json.dump(data, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
            temporary = Path(stream.name)
        temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('markdown', type=Path)
    parser.add_argument('--date', default=datetime.now(ZoneInfo('Asia/Taipei')).date().isoformat())
    parser.add_argument('--check', action='store_true', help='Validate only; do not write')
    parser.add_argument('--verify-links', action='store_true')
    args = parser.parse_args()
    date.fromisoformat(args.date)
    content = args.markdown.read_text(encoding='utf-8')
    validate(content)
    verify_code(content)
    if args.verify_links:
        verify_links(content)
    if not args.check:
        generated = datetime.now(ZoneInfo('Asia/Taipei')).strftime('%Y-%m-%d %H:%M') + ' (Taiwan time)'
        write_report(content, args.date, ROOT / 'public/reports', generated)
    print('Report validation passed' if args.check else 'Report and manifest written: ' + args.date)


if __name__ == '__main__':
    main()
