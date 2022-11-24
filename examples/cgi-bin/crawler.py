#!/usr/bin/env python3

# sudo apt install fcgiwrap
# sudo pip3 install markdown


# Import modules for CGI handling 
import cgi
import re
import os
import markdown
from simplesite import SimpleSite


def getMeta(fields: object, lookup: list, default: str = ''):
    '''
    Get a specific tag name from the list of meta fields located within document

    Will iterate through list of preferred tags (useful for SEO title)
    '''
    for tag in lookup:
        try:
            return md.Meta[tag][0]
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

    md = markdown.Markdown(extensions = ['meta'])
    html = md.convert(s)

    # Pull in the meta fields useful for spiders
    seotitle = getMeta(md.Meta, ['seotitle', 'title'], page)
    title = getMeta(md.Meta, ['title'], page)
    description = getMeta(md.Meta, ['description', 'excerpt'], '')
    image = getMeta(md.Meta, ['image'], '')

    # Process the image; it can be relatively resolved based on the original file.
    if image != '' and '://' not in image:
        image = site.hostname + site.path + os.path.dirname(page) + '/' + image

    # meta... og:title, og:image, og:description, description
    # Create the various head content for the HTML
    head = []
    head.append('<title>' + seotitle + '</title>')
    head.append('<meta property="og:title" content="' + seotitle.replace('"', '&quot;') + '"/>')
    if description != '':
        head.append('<meta name="description" content="' + description.replace('"', '&quot;') + '"/>')
        head.append('<meta property="og:description" content="' + description.replace('"', '&quot;') + '"/>')
    if image != '':
        head.append('<meta property="og:image" content="' + image + '"/>')

    # Render a basic page for crawlers to view now that everything has been loaded
    payload = '<!DOCTYPE html><html><head>' + \
        '\n'.join(head) + \
        '</head><body>' + \
        '<h1>' + title + '</h1>' + \
        html + \
        '</body></html>'
    site.render(payload)

else:
    site.error('Requested page not found', 404)
