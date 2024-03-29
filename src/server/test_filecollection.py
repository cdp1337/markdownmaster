from unittest import TestCase
import os

from filecollection import FileCollection
from markdownloader import MarkdownLoader
from siteconfig import get_config_for_tests

# Override some of the config settings for the test environment
config = get_config_for_tests()
config.path_config = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../test/assets/config.ini')
config.path_root = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../test/assets')
config.load()


class TestFileCollection(TestCase):
    def test_init(self):
        collection = FileCollection('tests')
        self.assertGreaterEqual(len(collection.files), 2)
        self.assertEqual('https://markdownmaster.test/tests.html', collection.url)

        file = collection.get_by_path('/tests/good_file.md')
        self.assertIsInstance(file, MarkdownLoader)
        self.assertEqual('Testing Bug Features', file.get_meta(['title']))
        self.assertEqual('/tests/good_file.md', file.path)

        file = collection.get_by_path('/tests/topic/some_sub_file.md')
        self.assertIsInstance(file, MarkdownLoader)
        self.assertEqual('I am a subfile', file.get_meta(['title']))
        self.assertEqual('/tests/topic/some_sub_file.md', file.path)

        file = collection.get_by_path('/invalid/file.md')
        self.assertIsNone(file)
