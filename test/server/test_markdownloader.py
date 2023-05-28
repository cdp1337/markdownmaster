import os
import unittest

from src.server.markdownloader import MarkdownLoader


def _get_good_file() -> MarkdownLoader:
    template_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../assets/tests/good_file.md')
    return MarkdownLoader('https://example.tld/tests/assets/good_file.html', template_file)


class TestMarkdownLoader(unittest.TestCase):
    def test_init(self):
        md = _get_good_file()
        self.assertIsInstance(md, MarkdownLoader)
        self.assertEqual('<h1>Test Page</h1>\n<p>This is test content about Zebras</p>', str(md))
        self.assertEqual('Alice', md.post['author'])
        self.assertEqual('https://example.tld/tests/assets/logo.png', md.post['logo']['src'])

    def test_get_meta(self):
        md = _get_good_file()
        self.assertEqual('2023-03-14', md.get_meta(['date']))
        self.assertEqual('empty', md.get_meta(['thisfielddoesnotexist'], 'empty'))
