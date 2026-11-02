import json
from pathlib import Path
import tempfile
import unittest

from publish_daily_report import HEADINGS, write_report, verify_code, validate


def structurally_valid_but_thin_report():
    sections = []
    for heading in HEADINGS:
        body = "內容" * 80 + "\n📌 今日重點：測試用重點\n[→ source](https://example.com/article)"
        sections.append(heading + "\n" + body)
    sections[1] += "\n資料時間：台灣時間。僅供參考。"
    sections.append("<!-- algo-progress: 01 -->")
    sections.append("<!-- sysdesign-progress: 01 -->")
    sections.append("<!-- ai-progress: 01 -->")
    sections.append("<!-- deep-read: 01 -->")
    sections.append("<!-- used: test -->")
    sections.append("<!-- backend-progress: 01 -->")
    return "\n\n".join(sections)


class PublicationTests(unittest.TestCase):
    def test_backfill_keeps_newer_and_older_reports_and_replaces_duplicate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest = root / 'manifest.json'
            manifest.write_text(json.dumps([
                {'date': '2026-11-03', 'generatedAt': 'new'},
                {'date': '2026-11-02', 'generatedAt': 'old'},
                {'date': '2026-11-01', 'generatedAt': 'older'},
            ]))
            write_report('報告內容', '2026-11-02', root, 'now')
            self.assertEqual(json.loads(manifest.read_text()), [
                {'date': '2026-11-03', 'generatedAt': 'new'},
                {'date': '2026-11-02', 'generatedAt': 'now'},
                {'date': '2026-11-01', 'generatedAt': 'older'},
            ])
            self.assertEqual(json.loads((root / '2026-11-02.json').read_text(encoding='utf-8'))['content'], '報告內容')
            write_report('報告內容', '2026-11-02', root, 'now')
            self.assertEqual(len(json.loads(manifest.read_text())), 3)

    def test_corrupt_manifest_is_preserved_without_writing_report(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest = root / 'manifest.json'
            manifest.write_text('not json')
            with self.assertRaises(ValueError):
                write_report('content', '2026-11-02', root, 'now')
            self.assertEqual(manifest.read_text(), 'not json')
            self.assertFalse((root / '2026-11-02.json').exists())

    def test_incomplete_report_is_rejected(self):
        with self.assertRaises(ValueError):
            validate('## 📰 一、國際與台灣重要新聞\n只有一區')

    def test_structurally_valid_but_thin_report_is_rejected_by_quality_gate(self):
        with self.assertRaisesRegex(ValueError, 'quality validation failed'):
            validate(structurally_valid_but_thin_report())

    def test_javascript_assertion_failure_blocks_publication(self):
        content = '\n'.join(['```js\nconsole.log("ok")\n```'] * 2 + [
            '```javascript\nimport assert from "node:assert/strict"; assert.equal(1, 2);\n```'])
        with self.assertRaisesRegex(ValueError, 'block 3 failed'):
            verify_code(content)


if __name__ == '__main__':
    unittest.main()
