#!/usr/bin/env python3

# sudo apt install fcgiwrap
# sudo pip3 install markdown


# Import modules for CGI handling 
import cgi
import re
import os
import markdown
from simplesite import SimpleSite
from templater import Templater


def getMeta(fields: object, lookup: list, default: str = ''):
    """
    Get a specific tag name from the list of meta fields located within document

    Will iterate through list of preferred tags (useful for SEO title)
    """
    for tag in lookup:
        try:
            return fields[tag][0]
        except KeyError:
            # Continue to the next lookup
            pass

    # If nothing returned, return the default.
    return default


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
    with open(doc) as f:
        s = f.read()

    md = markdown.Markdown(extensions=['meta'])
    html = md.convert(s)

    # Pull in the meta fields useful for spiders
    seotitle = getMeta(md.Meta, ['seotitle', 'title'], page)
    title = getMeta(md.Meta, ['title'], page)
    description = getMeta(md.Meta, ['description', 'excerpt'], '')
    image = getMeta(md.Meta, ['image'], '')

    # Process the image; it can be relatively resolved based on the original file.
    if image != '' and '://' not in image:
        image = site.hostname + site.path + os.path.dirname(page) + '/' + image

    template = Templater()
    template.set_canonical(site.hostname + os.path.join(site.path, page + '.html'))
    template.set_title(seotitle)
    if description != '':
        template.set_description(description)

    template.set_body('<h1>' + title + '</h1>' + html)
    site.render(template.soup.prettify())
    '''

    if image != '':
        head.append('<meta property="og:image" content="' + image + '"/>')

    '''

else:
    site.error('Requested page not found', 404)
