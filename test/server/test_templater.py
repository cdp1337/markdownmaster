import os
import unittest

from bs4 import BeautifulSoup

from src.server.templater import Templater
from src.server.siteconfig import get_config_for_tests

# Override some of the config settings for the test environment
config = get_config_for_tests()
config.path_config = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../assets/config.ini')
config.path_root = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../assets')
config.load()


def _get_good_template() -> Templater:
    template_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../assets/index.html')
    return Templater(template_file)


class TestTemplater(unittest.TestCase):

    def test_failed_init(self):
        with self.assertRaises(FileNotFoundError):
            Templater('invalid.doesnotexist')

    def test_init(self):
        tmpl = _get_good_template()
        self.assertIsInstance(tmpl.soup, BeautifulSoup)

    def test_set_title(self):
        tmpl = _get_good_template()
        tmpl.set_title('Test Title 123')
        self.assertIn('<title>Test Title 123</title>', str(tmpl))
        self.assertIn('<meta content="Test Title 123" property="og:title"/>', str(tmpl))

    def test_set_description(self):
        tmpl = _get_good_template()
        tmpl.set_description('This is a test description!')
        self.assertIn('<meta content="This is a test description!" property="og:description"/>', str(tmpl))
        self.assertIn('<meta content="This is a test description!" name="description"/>', str(tmpl))

    def test_set_body(self):
        tmpl = _get_good_template()
        tmpl.set_body('<p>hello world</p><a href="https://example.tld">There</a>')
        self.assertIn('<div id="cms"><p>hello world</p><a href="https://example.tld">There</a></div>', str(tmpl))
