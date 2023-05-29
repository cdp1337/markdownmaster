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

SimpleSite.type = SimpleSite.TYPE_XML
urls = []
comments = []

for collection_type in SiteConfig.get_types():
    try:
        collection = FileCollection(collection_type)
        urls.append(collection.url)
        for file in collection.files:
            if not file.get_meta(['draft'], False):
                urls.append(file.url)
    except FileNotFoundError:
        comments.append('Unable to read directory ' + collection_type)

header = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset 
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
    xmlns:xhtml="http://www.w3.org/1999/xhtml" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
'''

body = ''
for c in comments:
    body += '\t<!-- ' + c + '-->\n'

for u in urls:
    body += '\t<url>\n\t\t<loc>' + u + '</loc>\n\t</url>\n'

footer = '</urlset>'

SimpleSite.render(header + body + footer)
