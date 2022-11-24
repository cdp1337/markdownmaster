---
title: Site Configuration
author: Charlie Powell
tags: Howto, Configuration
---

## Web Application Configuration

The bulk of configuration required is performed within [js/config.js](../js/config.js).  This also is a convenient place to place custom javascript.


### List of Parmeters

| Parameter       | Type   | Description                                  |
|-----------------|--------|----------------------------------------------|
| elementId       | string | ID of element to attach CMS.js to            |
| mode            | string | Operation mode of site, "GITHUB" or "SERVER" |
| webpath         | string | Webpath of site (part after domain name)     |
| github.username | string | Github username                              |
| github.repo     | string | Github repository name                       |
| github.branch   | string | Branch for code                              |
| github.host     | string | Github API hostname                          |
| markdownEngine  | function | Markdown engine to use for processing      |
| layoutDirectory | string | Name of the layouts directory                |
| errorLayout     | string | Error layout template name                   |
| defaultView     | string | Default / home page                          |
| types           | object | List of types on the site                    |
| debug           | boolean | Set to true to enable debug messages        |


### Notable Configuration Details

**mode**

Set to "SERVER" for Apache2 or Nginx and "GITHUB" for github pages

**webpath**

When in SERVER mode, set this to the web path to use for the URL.
for example, if your site is located in https://domain.tld/cms/
your webpath should be '/cms/'
NOTE, a trailing slash is REQUIRED.

**defaultView**

The URL that will be the default view that will initially load
Examples:
'posts' -- Set default view to /posts.html
'pages/home' -- Set default view to /pages/home.html

**types**

Types of content to load, new types can be created for various content
Each type needs a name and layout attributes

**types.layout.list**

Template file to use for listing this content type

**types.layout.single**

Template file to use for rendering a single page

**types.layout.title**

Page title set automatically when browsing the listing page


## CGI Application Configuration

The server-side app has a configuration file which will need set too within [config.ini](../cgi-bin/config.ini).  These parameters control the CGI application responsible for assist with crawler access to your site.

```
[site]
host = https://yoursite.tld
webpath = /
defaultView = pages/home
types = pages, posts
debug = false
```

These values should be similar to the values within `config.js`.  The "`[site]`" at the top of the file is a system-level keyword and must remain.
