![CMS.js Logo](https://raw.githubusercontent.com/chrisdiana/cms.js/gh-pages/img/logo-md.png)

CMS.js is comprised of two components, a fully **C**lient-side, JavaScript **M**arkdown **S**ite generator in the spirit of [Jekyll](https://github.com/jekyll/jekyll) that uses plain ol' HTML, CSS and JavaScript to generate your website and a Python server-side component for providing support for crawlers and bots. Both portions of CMS.js are just a file-based CMS.

The client-side behaves in a Single-Page App fashion and only relies on the server having indexing support enabled.  No server-side scripts are necessary for the base application to function.

The server-side provides rudementary support for bot access to the site content.  They utilize the same files to generate valid HTML or XML for crawlers without Javascript support.

This fork is a HEAVILY modified copy of [Chris Diana's original](https://github.com/chrisdiana/cms.js) creation with a BUNCH of new features added.  **Warning**, it has a bunch of features added and is significantly larger in filesize, approximately 60kB up from 10Kb.


![CMS.js Screenshot](https://raw.githubusercontent.com/chrisdiana/cms.js/gh-pages/img/screenshot.png)

-----

![Version](https://img.shields.io/github/package-json/v/cdp1337/cms.js.svg)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/cdp1337/cms.js/CMS.JS%20CI%20Test)
![License](https://img.shields.io/github/license/cdp1337/cms.js.svg)


<p align="center">
  <span>English</span> |
  <a href="./README-zh.md">简体中文</a>
</p>


## Features

* Zero dependencies
* Abstract content types
* Custom templates
* Search, filtering, tagging and sorting
* Github, Apache, Nginx, Mail-in-a-box, and Nextcloud support
* Small footprint - about 60kb minified
* [marked.js](https://github.com/markedjs/marked) embedded
* Automatic body classes based on page
* Native JS events
* Full [History API](https://developer.mozilla.org/en-US/docs/Web/API/History) support
* Crawler and SEO support for most content
* Automatic sitemap.xml generation


## Demo

Check out a [live working site](https://veraciousnetwork.com)!


## Quick Start

CMS.js supports two website modes, Github and Server. Host your website on Github using Github Pages (similar to Jekyll) or use Server mode if you choose to self host your content.

1. Download the [latest release](https://github.com/cdp1337/cms.js/releases/latest)
2. Setup environment, refer to specific documentation for [Apache2](INSTALL.apache.md)* and [Mail-in-a-Box](INSTALL.mailinabox.md)
3. [Configure config.js and config.ini](examples/posts/site-configuration.md) to your liking

Note * Apache2 rewrite support needs updated for the CGI portion to work as of version 3.1.0.


## Documentation

For advanced usage of this framework, take a look through the other [post examples](examples/posts/), notably:

* [Using plugins](examples/posts/plugins-overview.md)
* [Hooking into native events](examples/posts/document-events.md)
* [Authoring content](examples/posts/authoring-pages.md)
* [Content Sorting](examples/posts/sorting.md)


## How it works

**Github Mode**

In Github mode, CMS.js uses the Github API to get the content of your repo and serve them as a full website. (@TODO needs tested on new version)

**Server Mode**

In Server mode, CMS.js takes advantage of the Server's Directory Indexing feature. By allowing indexes, CMS.js sends an AJAX call to your specified folders and looks for Markdown or HTML files.
After they are found, it takes care of everything else and delivers a full website.

Bots and crawlers automatically get routed to `/cgi-bin/crawler.py` to have the server perform the markdown-to-HTML transformation.  This script utilizes the same exact markdown files as normal visitors, so the content will be mostly consistent.


## Migration from Jekyll

**Importing Posts**

Once CMS.js is installed and running, simply copy all of your posts from your Jekyll project's `_post` folder to your designated CMS.js posts folder.

**Importing Pages**

Copy all of your Markdown pages from your Jekyll projects root folder into your designated CMS.js pages folder.



## Thanks!

* [Poole](https://github.com/poole/poole) (*Default Theme*)
* [Chris Diana](https://github.com/chrisdiana) maintainer of original version of CMS.js


## Contributing

All forms of contribution are welcome: bug reports, bug fixes, pull requests and simple suggestions. If you do wish to contribute, please check out the [Contributing Guide](https://github.com/chrisdiana/cms.js/wiki/Contributing-Guide) before making a pull request. Thanks!


## List of contributors

You can find the list of contributors [here](https://github.com/chrisdiana/cms.js/graphs/contributors).


## Building

Below are instructions on how to build this application from source.  **NOTE**, this is NOT required for deploying a production version, but instead for compiling your own version from source.


### Instructions for Windows

@todo, (I don't have windows, sorry)

### Instructions for Ubuntu 22.04 LTS

```bash
# Install dependencies
sudo apt install npm git
# Retrieve development build
git clone git@github.com:cdp1337/cms.js.git
# Switch to the directory where the development build is checked out
cd cms.js
NODE_ENV=dev npm install
```

### Node Scripts (all environments)

Watch for updates within src and compile dist/cms.js

`npm run watch`

Minify dist/cms.js into minified version (NOT included in watch)

`npm run minify`

Compile code into example site

`npm run example`

Full build: compile, minify, and example (useful for packaging)

`npm run build`
