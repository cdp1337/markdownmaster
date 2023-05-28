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

from markdownloader import MarkdownLoader
from siteconfig import SiteConfig


class FileCollection:
    def __init__(self, col_type: str):
        self.files = []

        p_dir = SiteConfig.get_path_root()
        w_dir = SiteConfig.get_path_web()
        host = SiteConfig.get_host()

        for file in os.listdir(os.path.join(p_dir, col_type)):
            if os.path.isdir(os.path.join(p_dir, col_type, file)):
                # Iterate once
                for subfile in os.listdir(os.path.join(p_dir, col_type, file)):
                    if subfile.endswith('.md'):
                        url = host + os.path.join(w_dir, col_type, file, subfile.replace('.md', '.html'))
                        path = os.path.join(p_dir, col_type, file, subfile)
                        self.files.append(MarkdownLoader(url, path))
            elif file.endswith('.md'):
                url = host + os.path.join(w_dir, col_type, file.replace('.md', '.html'))
                path = os.path.join(p_dir, col_type, file)
                self.files.append(MarkdownLoader(url, path))
