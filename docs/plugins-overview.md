---
title: CMS Plugins Overview
author: Charlie Powell
tags: [Howto, Configuration, Authoring]
---

There are a number of system plugins and extras provided by default.

* [Author Tag](cms-author.md)
* [Button Tag](cms-button.md)
* [Icon Tag](cms-icon.md)
* [Mastodon Share Button](cms-mastodon-share.md)
* [Page List](cms-pagelist.md)
* [Search Box](cms-search.md)



### Plugin "pagebodyclass"

<!-- @todo move this to its own 'extra' group -->

Register classes on the body node based on the current page.  Useful for styling page-specific themes.
Also provides support for updating navigation entries, (as an option).

**Parameters**

Parameters for the pagebodyclass are defined with Javascript and the `getPlugin` method.

| Parameter      | Required | Example                         | Description                                                             |
|----------------|----------|---------------------------------|-------------------------------------------------------------------------|
| navLinks       | no       | [/page-pages-/, '.nav-subpage'] | Navigation link data, if set will be used to update link classes        |
| navSelector    | no       | ".nav"                          | Navigation target selector, passed to querySelectorAll                  |
| navActiveClass | no       | "active"                        | Set to the class name to denote links as "active", defaults to "active" |

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
