# MarkdownMaster CMS

<!-- @todo get a new logo 
![CMS.js Logo](img/logo-md.png)
-->

MarkdownMaster CMS is a client-side library to render Markdown files from flat-files 
for site pages and content using HTML layouts in the spirit 
of [Jekyll](https://github.com/jekyll/jekyll), 
but with no need for server-side scripts, processing, or builds
(though some helper Python scripts are provided for some actions).

Deploying new pages is as simple as uploading Markdown files to your server.
This can be done via automated sync applications such as NextCloud or just uploading
via SFTP or your web hosting interface.  _No building or scripts needed for deployment!_

The client-side behaves as a Single-Page App and only relies on the server 
having indexing support enabled.
No server-side scripts are necessary for the base application to run!

The server-side provides rudimentary support for bot access to the site content. 
They utilize the same files to generate valid HTML or XML for crawlers without 
Javascript support.

This project is based off [Chris Diana's CMS.js](https://github.com/chrisdiana/cms.js) 
with a BUNCH of new features added.


![MarkdownMaster CMS Screenshot](img/screenshot.png)

-----

[![Version](https://img.shields.io/github/package-json/v/cdp1337/markdownmaster.svg)](https://github.com/cdp1337/markdownmaster/releases)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/cdp1337/markdownmaster/test.yml?branch=main)](https://github.com/cdp1337/markdownmaster/actions)
[![License](https://img.shields.io/github/license/cdp1337/markdownmaster.svg)](https://github.com/cdp1337/markdownmaster/blob/main/LICENSE.md)


## Features

* Zero dependencies
* Abstract content types
* Custom templates
* Search, filtering, tagging and sorting
* Apache, Nginx, Mail-in-a-box, and Nextcloud support
* Small footprint - under 100kb minified
* [marked.js](https://github.com/markedjs/marked) embedded
* Automatic body classes based on page
* Native JS events
* Full [History API](https://developer.mozilla.org/en-US/docs/Web/API/History) support
* Crawler and SEO support for most content
* Automatic sitemap.xml generation


## Demo

Check out a [live working site](https://veraciousnetwork.com)!


## Quick Start

1. Download the [latest release](https://github.com/cdp1337/markdownmaster/releases/latest)
2. Setup environment, refer to specific documentation for [Apache2](docs/INSTALL.apache.md)* and [Mail-in-a-Box](docs/INSTALL.mailinabox.md)
3. [Configure config.js and config.ini](docs/site-configuration.md) to your liking

Note * Apache2 rewrite support needs updated for the CGI portion to work as of version 3.1.0.


## Documentation

For advanced usage of this framework, 
take a look through the other [post examples](examples/posts/) and the various
[documentation available](docs/).

* [Using plugins](docs/plugins-overview.md)
* [Hooking into native events](docs/document-events.md)
* [Authoring content](docs/authoring-pages.md)
* [Content Sorting](docs/sorting.md)
* [Development Guide](docs/development.md)


## How it works

MarkdownMaster CMS takes advantage of the server's directory indexing feature. 
By allowing indexes, MarkdownMaster CMS sends an AJAX call to your specified folders 
and looks for Markdown and HTML files.
After they are found, it takes care of everything else and delivers a full website.

Bots and crawlers automatically get routed to `/cgi-bin/crawler.py` to have the 
server perform the markdown-to-HTML transformation. 
This script utilizes the same exact markdown files as normal visitors, 
so the content will be mostly consistent.


## Migration from Jekyll

**Importing Posts**

Once MarkdownMaster CMS is installed and running, simply copy all of your posts 
from your Jekyll project's `_post` folder to your designated MarkdownMaster CMS posts folder.

**Importing Pages**

Copy all of your Markdown pages from your Jekyll projects root folder into your 
designated MarkdownMaster CMS pages folder.


## Thanks!

* [Poole](https://github.com/poole/poole) (*Default Theme*)
* [Chris Diana](https://github.com/chrisdiana) maintainer of original version of CMS.js

