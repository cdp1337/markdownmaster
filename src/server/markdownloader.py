"""
MarkdownMaster CMS

The MIT License (MIT)
Copyright (c) 2023 Charlie Powell
https://github.com/cdp1337/markdownmaster

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""

import os
import re

import markdown
import frontmatter
from datetime import date
from siteconfig import SiteConfig


def _get_excerpt(content: str) -> str:
    text = ''
    for line in content.split('\n'):
        if line.strip() == '' and text != '':
            # Stop after the first paragraph
            break

        if line.strip() == '':
            continue

        if re.match(r'^[a-zA-Z].*', line) and text == '':
            # Line starts with a word and text is empty; trigger this to start the paragraph
            text += line.strip() + ' '
        elif text != '':
            # If the text has been started, then just add whatever text to the detected string
            # This provides for an easy chance to skip any H# tags, images, and other tags
            # which are commonly at the top of pages, while still allowing some inside the paragraph
            text += line.strip() + ' '

    # Strip any tags inside the loaded text, this will just be a plain text excerpt.
    # Strip {...} HTML attribute tags from the text
    text = re.sub(r'\{.*?}', '', text)
    # Strip images from the text
    text = re.sub(r'!\[.*?]\(.*?\)', '', text)
    # Drop the link from links
    text = re.sub(r'\[(.*?)]\(.*?\)', '\\1', text)
    # Drop italic and bold
    text = re.sub(r'[*_]', '', text)

    return text.strip()


class MarkdownLoader:
    def __init__(self, filename: str):
        """
        Initialize and load a Markdown file from the filesystem
        :param filename: Fully resolved path, ie: "/var/www/posts/my_post.md"
        """
        self.path = filename[len(SiteConfig.get_path_root()):]
        self.url = SiteConfig.get_host() + self.path.replace('.md', '.html')
        self.dir = os.path.dirname(self.path)
        self.post = frontmatter.load(filename)

        # Parse attributes for src and href tags,
        # these allow for relative attributes, but should be resolved
        # based off the file URL so that assets work on different pages
        # ie: listing pages
        # While we're in this loop, let's ensure all keys are lowercase.
        for key in sorted(self.post.keys()):
            if re.match('.*[A-Z].*', key) is not None:
                l_key = key.lower()
                self.post[l_key] = self.post[key]
                del(self.post[key])
                key = l_key

            try:
                href = self.post[key]['href']
                if '://' not in href and not href.startswith('/'):
                    self.post[key]['href'] = os.path.join(self.dir, href)
            except (KeyError, TypeError):
                try:
                    src = self.post[key]['src']
                    if '://' not in src and not src.startswith('/'):
                        self.post[key]['src'] = os.path.join(self.dir, src)
                    if 'alt' not in self.post[key]:
                        self.post[key]['alt'] = os.path.basename(src)
                except (KeyError, TypeError):
                    pass

            if type(self.post[key]) == date:
                # Convert these to a simple string instead for easier passing of data
                self.post[key] = date.isoformat(self.post[key])

        # Expected values
        if 'date' not in self.post:
            if re.match('.+([0-9]{4})[-/]([0-9]{2})[-/]([0-9]{2}).+', self.path):
                # Load the date from the URL
                m = re.match('.+([0-9]{4})[-/]([0-9]{2})[-/]([0-9]{2}).+', self.path)
                self.post['date'] = '-'.join([m.group(1), m.group(2), m.group(3)])
            else:
                # Load the date from the last-modified flag
                self.post['date'] = date.fromtimestamp(os.path.getmtime(filename)).isoformat()

        if 'draft' not in self.post:
            self.post['draft'] = False

        if 'excerpt' not in self.post:
            self.post['excerpt'] = _get_excerpt(self.post.content)

    def get_meta(self, lookup: list, default: str = ''):
        """
        Get a specific tag name from the list of meta fields located within document

        Will iterate through list of preferred tags (useful for SEO title)

        :param lookup: List of tags to search, ie: ["title", "seotitle"]
        :param default: Default return value if no tags were located
        """
        for tag in lookup:
            try:
                return self.post[tag]
            except KeyError:
                # Continue to the next lookup
                pass

        # If nothing returned, return the default.
        return default

    def get_metas(self) -> dict:
        """
        Get all meta values as a simple dictionary
        """
        ret = {}
        for key in sorted(self.post.keys()):
            ret[key] = self.post[key]
        return ret

    def __str__(self) -> str:
        """
        Get this file in its full HTML version
        """
        md = markdown.Markdown()
        return md.convert(self.post.content)

    def get_listing(self) -> str:
        """
        Get the listing page representation for this file as HTML
        """
        title = self.get_meta(['title', 'seotitle'], os.path.basename(self.url))
        excerpt = self.get_meta(['excerpt', 'description'], '')
        image = self.get_meta(['image'], None)

        html = '<article><h2><a href="' + self.url + '">' + title + '</a></h2><p>' + excerpt + '</p>'
        if image is not None and 'src' in image:
            html += '<img src="' + image['src'] + '"/>'
        html += '</article>'
        return html
