import os
import re

import markdown
import frontmatter


class MarkdownLoader:
    def __init__(self, url: str, filename: str):
        self.url = url
        self.dir = os.path.dirname(url)
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

    def get_meta(self, lookup: list, default: str = ''):
        """
        Get a specific tag name from the list of meta fields located within document

        Will iterate through list of preferred tags (useful for SEO title)
        """
        for tag in lookup:
            try:
                return self.post[tag]
            except KeyError:
                # Continue to the next lookup
                pass

        # If nothing returned, return the default.
        return default


    def __str__(self):
        md = markdown.Markdown()
        return md.convert(self.post.content)
