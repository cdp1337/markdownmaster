# MarkdownMaster CMS

<!-- @todo get a new logo 
![CMS.js Logo](img/logo-md.png)
-->

MarkdownMaster CMS is a 100%* client-side, no-database, flat-file framework to 
render a full HTML site from flat Markdown content files and HTML templates, 
in the spirit of 
[Jekyll](https://github.com/jekyll/jekyll).

This CMS behaves as a Single-Page Application and loads all files from the server via 
the auto-index feature in either 
[Apache](https://httpd.apache.org/docs/2.4/mod/mod_autoindex.html)
or [Nginx](https://nginx.org/en/docs/http/ngx_http_autoindex_module.html) and performs 
all processing of templates and content within the browser.

Note* there _is_ a server-side component written as a Python CGI script to 
better facilitate crawlers, bots, and search engines.  This component utilizes the 
same flat files and templates as the client-side application.

Because there is no database, registry, or administration of pages, 
deploying new pages is as simple as just uploading Markdown files to your server.
This can be done via automated sync applications such as NextCloud or just uploading
via SFTP or your web hosting interface.  _No building or scripts needed for deployment!_

This project is originally based from
[Chris Diana's CMS.js](https://github.com/chrisdiana/cms.js).


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
* Small footprint
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
2. Setup environment, refer to specific documentation for 
   [NextCloud](docs/INSTALL.nextcloud-nginx.md) or [Mail-in-a-Box](docs/INSTALL.mailinabox.md)
3. [Configure config.js and config.ini](docs/site-configuration.md) to your liking


## Documentation

For advanced usage of this framework, 
take a look through the other [post examples](examples/posts/) and the various
[documentation available](docs/).

* [Using extras](docs/extras-overview.md)
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

## Debugging

Debug mode can be enabled on your live site by appending `?testdebug=1` to the URL.
This will force the CMS into debug mode where messages are printed to the browser console.

Testing bot and crawler responses can be done by append `?testcrawler=1` to the URL.
This will route to the cgi-bin Python version of the site which should be seen by 
GoogleBot and crawlers.

## Thanks!

* [Poole](https://github.com/poole/poole) (*Default Theme*)
* [Chris Diana](https://github.com/chrisdiana) maintainer of original version of CMS.js

