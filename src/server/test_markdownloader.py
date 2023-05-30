import os
import unittest

from markdownloader import MarkdownLoader
from siteconfig import get_config_for_tests

# Override some of the config settings for the test environment
config = get_config_for_tests()
config.path_config = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../test/assets/config.ini')
config.path_root = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../test/assets')
config.load()


def _get_file(filename: str) -> MarkdownLoader:
    template_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../test/assets/tests/', filename)
    return MarkdownLoader(template_file)


class TestMarkdownLoader(unittest.TestCase):
    def test_init(self):
        md = _get_file('good_file.md')
        self.assertIsInstance(md, MarkdownLoader)
        self.assertEqual('<h1>Test Page</h1>\n<p>This is test content about Zebras</p>', str(md))
        self.assertEqual('/tests/good_file.md', md.path)
        self.assertEqual('https://markdownmaster.test/tests/good_file.html', md.url)
        self.assertEqual('/tests', md.dir)

    def test_init_with_date(self):
        """
        Test for a Date object to be converted to a date string
        """
        md = _get_file('dates_are_difficult.md')
        self.assertIsInstance(md, MarkdownLoader)
        self.assertEqual('2023-04-10', md.get_meta(['date']))

    def test_init_with_date_in_url(self):
        """
        Test for a date-string in the URL
        """
        md = _get_file('topic/2023-03-14-test.md')
        self.assertIsInstance(md, MarkdownLoader)
        self.assertEqual('2023-03-14', md.get_meta(['date']))

    def test_init_auto_excerpt(self):
        """
        Test for automatic excerpts
        """
        md = _get_file('auto_excerpt.md')
        self.assertIsInstance(md, MarkdownLoader)
        self.assertEqual('This sentence should come through as the excerpt since it does not have one '
                         'assigned. However, links, italics, and other formatting should not be '
                         'included.', md.get_meta(['excerpt']))

    def test_get_meta(self):
        md = _get_file('good_file.md')
        self.assertEqual('2023-03-14', md.get_meta(['date']))
        self.assertEqual('empty', md.get_meta(['thisfielddoesnotexist'], 'empty'))
        self.assertEqual('Alice', md.get_meta(['author']))
        self.assertEqual('/tests/logo.png', md.get_meta(['logo'])['src'])

        # The CTA field uses a relative HREF
        cta = md.get_meta(['cta'])
        self.assertEqual('/tests/good_file_no_date.html', cta['href'])
        self.assertEqual('This one doesn\'t have a title', cta['title'])

    def test_get_metas(self):
        md = _get_file('good_file.md')
        metas = md.get_metas()
        self.assertEqual('2023-03-14', metas['date'])
        self.assertEqual('Alice', metas['author'])
