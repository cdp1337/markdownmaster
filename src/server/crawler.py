#!/opt/markdownmaster/bin/python3

import cgi
import re
import os
import markdown
from simplesite import SimpleSite
from templater import Templater
from markdownloader import MarkdownLoader

# Load the site and its configuration
site = SimpleSite()

# Create instance of FieldStorage 
form = cgi.FieldStorage()

try:
    page = form['page'].value
except KeyError:
    # No page requested, detect the default page and redirect there.
    site.redirect(site.hostname + site.path + site.default + '.html')

# Perform some basic sanitization on the page input
page = page.replace('../', '')
# Trim page arguments, we don't need them.
page = re.sub(r'\?.*$', '', page)
# Trim .html, we'll look up the source markdown files instead.
page = page.replace('.html', '')

# Check if the page is present
doc = '../' + page + '.md'

if os.path.exists(doc) and os.path.isfile(doc):
    loader = MarkdownLoader(site.hostname + os.path.join(site.path, page + '.html'), doc)

    # Pull in the meta fields useful for spiders
    seotitle = loader.get_meta(['seotitle', 'title'], page)
    title = loader.get_meta(['title'], page)
    description = loader.get_meta(['description', 'excerpt'], '')
    image = loader.get_meta(['image'], '')

    template = Templater()
    template.set_canonical(loader.url)
    template.set_title(seotitle)
    if description != '':
        template.set_description(description)

    if image != '' and 'src' in image:
        template.set_meta_content('og:image', image)

    template.set_body('<h1>' + title + '</h1>' + str(loader))
    site.render(str(template))

else:
    site.error('Requested page not found', 404)
