---
title: Site Configuration
author: Charlie Powell
tags: [Howto, Configuration]
---

## Web Application Configuration

The bulk of configuration required is performed within [js/config.js](../examples/js/config.js). 
This also is a convenient place to place custom javascript.


### Overview of Parameters

| Parameter            | Type     | Description                              |
|----------------------|----------|------------------------------------------|
| elementId            | string   | ID of element to attach CMS.js to        |
| webpath              | string   | Webpath of site (part after domain name) |
| markdownEngine       | function | Markdown engine to use for processing    |
| layoutDirectory      | string   | Name of the layouts directory            |
| defaultView          | string   | Default / home page                      |
| types                | list     | List of types on the site                |
| debug                | boolean  | Set to true to enable debug messages     |
| dateFormat           | function | Function for formatting date strings     |
| dateParser           | RegExp   | Regexp for detecting dates in page URLs  |
| frontMatterSeperator | string   | FrontMatter separator in files           |
| extension            | string   | File extension to use for content        |
| messageClassName     | string   | class name for debug messages            |
| titleSearchResults   | string   | Title for search pages                   |


### Notable Configuration Details

---

**Debug Mode**

Set to true to enable debug logging, (will enable logging events to the console)

```js
debug: false
```

---

**webpath**

Set this to the web path to use for the URL, 
for example, if your site is located in https://domain.tld/cms/
your webpath should be '/cms/'
NOTE, a trailing slash is REQUIRED.

```.js
webpath: '/'
```

---

**defaultView**

The URL that will be the default view that will initially load

* 'posts' -- Set default view to `/posts.html`
* 'pages/home' -- Set default view to `/pages/home.html`

```.js
defaultView: 'posts'
```

---

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


## CGI Application Configuration

The server-side app needs configured via its own [config.ini](../examples/cgi-bin/config.ini)
within the `cgi-bin` directory. 
These parameters are specific to just the CGI / Python version of the CMS responsible 
for rendering the site to bots and crawlers.

```ini
[site]
host = https://yoursite.tld
webpath = /
defaultView = pages/home
types = pages, posts
debug = false
```

These values should be similar to the values within `config.js`. 
The "`[site]`" at the top of the file is a system-level keyword and must remain.
