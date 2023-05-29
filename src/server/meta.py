#!/opt/markdownmaster/bin/python3
#
# Generate a sitemap based on the files within this location
# This is required as a server-side or manual action because this file is not processed with javascript.
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

from simplesite import SimpleSite
from filecollection import FileCollection
from siteconfig import SiteConfig

SimpleSite.type = SimpleSite.TYPE_JSON
payload = {}

for collection_type in SiteConfig.get_types():
    try:
        collection = FileCollection(collection_type)
        payload[collection_type] = []
        for file in collection.files:
            if not file.get_meta(['draft'], False):
                payload[collection_type].append({
                    'url': file.url,
                    'path': file.path,
                    'meta': file.get_metas()
                })
    except FileNotFoundError:
        pass

SimpleSite.render(payload)
