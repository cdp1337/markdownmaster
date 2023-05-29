#!/opt/markdownmaster/bin/python3
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

import cgi
import re
import os
from .simplesite import SimpleSite
from .filecollection import FileCollection
from .templater import Templater
from .markdownloader import MarkdownLoader
from .siteconfig import SiteConfig

# Create instance of FieldStorage 
form = cgi.FieldStorage()

try:
    page = form['page'].value
except KeyError:
    # No page requested, detect the default page and redirect there.
    SimpleSite.redirect(SiteConfig.get_home_url())
    exit()

# Perform some basic sanitization on the page input
page = page.replace('../', '')
# Trim page arguments, we don't need them.
page = re.sub(r'\?.*$', '', page)
# Trim .html, we'll look up the source markdown files instead.
page = page.replace('.html', '')

# Check if the page is present
doc = os.path.join(SiteConfig.get_path_root(), page + '.md')

if os.path.exists(doc) and os.path.isfile(doc):
    loader = MarkdownLoader(doc)

    # Pull in the meta fields useful for spiders
    seotitle = loader.get_meta(['seotitle', 'title'], page)
    title = loader.get_meta(['title'], page)
    description = loader.get_meta(['description', 'excerpt'], '')
    image = loader.get_meta(['image'], '')

    template = Templater(os.path.join(SiteConfig.get_path_root(), 'index.html'))
    template.set_canonical(loader.url)
    template.set_title(seotitle)
    if description != '':
        template.set_description(description)

    if image != '' and 'src' in image:
        template.set_meta_content('og:image', image)

    template.set_body('<h1>' + title + '</h1>' + str(loader))
    SimpleSite.render(str(template))

else:
    # Try a listing page instead
    doc = os.path.join(SiteConfig.get_path_root(), page)
    if os.path.exists(doc) and page in SiteConfig.get_types():
        html = '<h1>Listing of ' + page + '</h1>'
        collection = FileCollection(page)
        for file in collection.files:
            if not file.get_meta(['draft'], False):
                html += file.get_listing()

        template = Templater(os.path.join(SiteConfig.get_path_root(), 'index.html'))
        template.set_canonical(SiteConfig.get_host() + os.path.join(SiteConfig.get_path_web(), page + '.html'))
        template.set_title('Listing of ' + page)
        template.set_body(html)
        SimpleSite.render(str(template))
    else:
        SimpleSite.error('Requested page not found', 404)
