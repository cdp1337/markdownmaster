---
title: CMS Plugins Overview
author: Charlie Powell
tags: Howto, Configuration
---

There are a number of system plugins available by default.  To save on performance however, these plugins are NOT enabled by default.

To enable plugins, use the following code.  Multiple plugins can be included in a list of strings.

```.js
// Initialize CMS.js
var site = CMS(config);
site.init();

// Load some plugins
site.enablePlugin(['pagebodyclass', 'pagelist']);
```


## Plugins Available

| Plugin Key     | Description                                                   |
| mastodon_share | Generates share links for Mastodon                            |
| pagebodyclass  | Dynamically sets classnames on the body based on current page |
| pagelist       | Provides support for embedding a list of pages                |
| search         | Provides support for search boxes                             |



### mastodon_share

Enables rendering of a mastodon share button on pages.  Will allow the user to enter their instance URL.

**Parameters**

At the moment no parameters are configurable

**Example**

```.html
<a href="#" data-plugin="cms:mastodon_share" class="mastodon-share-button">
  <i class="fab fa-mastodon"></i>
  Share on Mastodon
</a>
```

**Renders (if enabled)**

<a href="#" data-plugin="cms:mastodon_share" class="mastodon-share-button">
  <i class="fab fa-mastodon"></i>
  Share on Mastodon
</a>



### pagebodyclass

Register classes on the body node based on the current page.  Useful for styling page-specific themes.
Also provides support for updating navigation entries, (as an option).

**Parameters**

navLinks:
  Navigation link data, if set will be used to update link classes

navSelector:
  Navigation target selector, passed to querySelectorAll

navActiveClass:
  Set to the class name to denote links as "active", defaults to "active"

**Example**

Within `js/config.js`

```.js
// Configure the site links
site.getPlugin('pagebodyclass').navLinks = [
	['page-posts-listing', '.nav-link-posts'],
	['page-posts-single', '.nav-link-posts'],
	['page-pages-games', '.nav-link-games'],
	[/page-pages-games-.+/, '.nav-link-games'],
	['page-pages-discord', '.nav-link-discord'],
];
site.getPlugin('pagebodyclass').navSelector = '.nav';
```

**Renders (if enabled)**

N/A (check rendered sourcecode)



### pagelist

Generate a list of pages which match given parameters

**Parameters**

type:
  Type of content to retrieve

layout:
  Template file to use for rendering content, (useful if you have an embed-specific template)

link:
  URL fragment to match content against via Javascript string.match()

**Example**

```.html
<div data-plugin="cms:pagelist" data-type="pages" data-layout="page-list" data-link="pages/games/">Loading Content...</div>
```
**Renders (if enabled)**

<div data-plugin="cms:pagelist" data-type="pages" data-layout="page-list" data-link="pages/games/">Loading Content...</div>



### search

Provides support for a search box on the site

**Parameters**

At the moment no parameters are configurable

**Example**

```.html
<input type="search" data-plugin="cms:search" placeholder="Search Site"/>
```
**Renders (if enabled)**

<input type="search" data-plugin="cms:search" placeholder="Search Site"/>