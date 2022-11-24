#!/usr/bin/env python3
#
# Generate a sitemap based on the files within this location
# This is required as a server-side or manual action because this file is not processed with javascript.

import os
from simplesite import SimpleSite

site = SimpleSite()
site.type = SimpleSite.TYPE_XML
urls = []
comments = []

for dir in site.types:
    try:
        for file in os.listdir(os.path.join('..', dir)):
            if os.path.isdir(os.path.join('..', dir, file)):
                # Iterate once
                for subfile in os.listdir(os.path.join('..', dir, file)):
                    if subfile.endswith('.md'):
                        urls.append(os.path.join(site.hostname, dir, file, subfile.replace('.md', '.html')))
            elif file.endswith('.md'):
                urls.append(os.path.join(site.hostname, dir, file.replace('.md', '.html')))
    except FileNotFoundError:
        comments.append('Unable to read directory ' + dir)

header = '''
<?xml version="1.0" encoding="UTF-8"?>
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

site.render(header + body + footer)
