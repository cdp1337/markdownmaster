---
title: Site Configuration
author: Charlie Powell
tags: Howto, Configuration
---

## Web Application Configuration

The bulk of configuration required is performed within [js/config.js](../js/config.js).  This also is a convenient place to place custom javascript.


### List of Parmeters

| Parameter       | Type     | Description                                  |
|-----------------|----------|----------------------------------------------|
| elementId       | string   | ID of element to attach CMS.js to            |
| mode            | string   | Operation mode of site, "GITHUB" or "SERVER" |
| webpath         | string   | Webpath of site (part after domain name)     |
| github.username | string   | Github username                              |
| github.repo     | string   | Github repository name                       |
| github.branch   | string   | Branch for code                              |
| github.host     | string   | Github API hostname                          |
| markdownEngine  | function | Markdown engine to use for processing        |
| layoutDirectory | string   | Name of the layouts directory                |
| errorLayout     | string   | Error layout template name                   |
| defaultView     | string   | Default / home page                          |
| types           | list     | List of types on the site                    |
| listAttributes  | list     | List of attributes with multiple attributes  |
| urlAttributes   | list     | List of attributes treated as URLs           |
| debug           | boolean  | Set to true to enable debug messages         |


### Notable Configuration Details

// Set to true to enable debug logging, (will enable logging events to the console)
debug: false,


**mode**

Set to "SERVER" for Apache2 or Nginx and "GITHUB" for github pages

```.js
// Mode 'GITHUB' for Github Pages, 'SERVER' for Self Hosted
// Defaults to Server mode if not specified
mode: 'SERVER',
```

**webpath**

When in SERVER mode, set this to the web path to use for the URL.
for example, if your site is located in https://domain.tld/cms/
your webpath should be '/cms/'
NOTE, a trailing slash is REQUIRED.

```.js
// When in SERVER mode, set this to the web path to use for the URL.
// for example, if your site is located in https://domain.tld/cms/
// your webpath should be '/cms/'
// NOTE, a trailing slash is REQUIRED.
webpath: '/',
```

**defaultView**

The URL that will be the default view that will initially load
Examples:
'posts' -- Set default view to /posts.html
'pages/home' -- Set default view to /pages/home.html

```.js
// The URL that will be the default view that will initially load
// Examples:
// 'posts' -- Set default view to /posts.html
// 'pages/home' -- Set default view to /pages/home.html
defaultView: 'posts',
```

**types**

Types of content to load, new types can be created for various content
Each type needs a name and layout attributes

```.js
types: [
  {
    name: 'posts',
    layout: {
      list: 'post-list',
      single: 'post',
      sort: 'datetime-r',
      title: 'Posts'
    },
  },
  {
    name: 'pages',
    layout: { 
      list: 'page-list', 
      single: 'page',
      sort: 'title',
      title: 'Pages'
    },
  },
],
```

**types.layout.list**

Template file to use for listing this content type

**types.layout.single**

Template file to use for rendering a single page

**types.layout.title**

Page title set automatically when browsing the listing page

**types.layout.sort**

Default sort mode for this article type

**listAttributes**

List of attributes that expect multiple values that are comma separated

```.js
listAttributes: ['tags']
```

**urlAttributes**

List of attributes that get treated as a URL.  These can be resolved based on the source markdown file

```.js
urlAttributes: ['image', 'banner']
```


## CGI Application Configuration

The server-side app needs configured via its own [config.ini](../cgi-bin/config.ini) within the `cgi-bin` directory.  These parameters are specific to just the CGI / Python version of the CMS responsible for rendering the site to bots and crawlers.

```
[site]
host = https://yoursite.tld
webpath = /
defaultView = pages/home
types = pages, posts
debug = false
```

These values should be similar to the values within `config.js`.  The "`[site]`" at the top of the file is a system-level keyword and must remain.
