import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from update_report import BASE_DIR, HEADINGS, REQUIRED, load_quality_profile, taiwan_now, update, validate, validate_quality


class QualityProfileTests(unittest.TestCase):
    def test_rejects_section_prefixes_that_are_not_exact_headings(self):
        self.assertFalse(validate("\n".join(REQUIRED)))

    def test_uses_explicit_taipei_timezone_for_publication_dates(self):
        self.assertEqual(taiwan_now().tzinfo.key, "Asia/Taipei")

    def test_uses_the_script_directory_as_the_report_root(self):
        expected_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.assertEqual(BASE_DIR, expected_root)

    def test_loads_required_global_thresholds(self):
        profile = load_quality_profile("report_quality.json")

        self.assertEqual(profile["global"]["min_utf8_bytes"], 40000)
        self.assertEqual(profile["global"]["min_unique_urls"], 35)

    def test_rejects_quality_profile_with_missing_section_rule(self):
        profile = {
            "global": {"min_utf8_bytes": 1, "min_unique_urls": 1, "min_action_markers": 1},
            "sections": {"📰": {"min_chars": 1}},
        }
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False) as file:
            json.dump(profile, file)
            path = file.name
        self.addCleanup(os.unlink, path)

        with self.assertRaisesRegex(ValueError, "missing section rules"):
            load_quality_profile(path)

    def test_rejects_report_with_all_headings_but_too_few_bytes(self):
        profile = {"global": {"min_utf8_bytes": 100000, "min_unique_urls": 0, "min_action_markers": 0}, "sections": {}}

        errors = validate_quality("\n".join(REQUIRED), profile)

        self.assertTrue(any("min_utf8_bytes" in error for error in errors))

    def test_rejects_repeated_urls_when_unique_source_minimum_is_not_met(self):
        profile = {"global": {"min_utf8_bytes": 1, "min_unique_urls": 2, "min_action_markers": 0}, "sections": {}}
        content = "\n".join(REQUIRED) + "\nhttps://example.com/article\nhttps://example.com/article"

        errors = validate_quality(content, profile)

        self.assertTrue(any("unique URLs" in error for error in errors))

    @patch("update_report.update_manifest")
    @patch("update_report.save_report")
    def test_does_not_write_when_quality_check_fails(self, save_report, update_manifest):
        with self.assertRaises(SystemExit):
            update("\n".join(REQUIRED))

        save_report.assert_not_called()
        update_manifest.assert_not_called()

    @patch("update_report.sys.stdout", new_callable=lambda: Cp950Stdout())
    def test_quality_failure_exits_cleanly_on_cp950_console(self, _stdout):
        with self.assertRaises(SystemExit):
            update("\n".join(REQUIRED))

    def test_check_mode_reports_quality_failures_without_writing(self):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".md", delete=False) as report:
            report.write("\n".join(HEADINGS))
            report_path = report.name
        self.addCleanup(os.unlink, report_path)

        result = subprocess.run(
            [sys.executable, "update_report.py", "--check", report_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        )

        self.assertEqual(result.returncode, 1)
        self.assertIn("quality validation failed", result.stdout)


class Cp950Stdout(io.StringIO):
    def write(self, text):
        text.encode("cp950")
        return super().write(text)


if __name__ == "__main__":
    unittest.main()
