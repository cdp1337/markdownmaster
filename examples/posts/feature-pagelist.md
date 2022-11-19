---
layout: post
title: Pagelist Feature
excerpt: Feature to render a list of content on a subpage (or anywhere on the site)
author: cdp1337
---

This will list all posts within this site, much how post-list will function.

This feature can be used on any page or markdown file on the site, (markdown can support embedding HTML natively).

## Setup and Attributes

Any block-level HTML node (div, main, article, aside, etc), can be used, the plugin doesn't care.

| Parameter   | Required | Example                | Description                                                         |
|-------------|----------|------------------------|---------------------------------------------------------------------|
| data-plugin | yes      | "cms:pagelist"         | Indicates to the plugin to use this element                         |
| data-type   | yes      | "posts,pages,etc"      | Any valid content type defined on your site                         |
| data-layout | no       | "post-list"            | Layout to use for rendering content, useful for controlling UX      |
| data-link   | no       | "^posts/subproject/.+" | Regex or regular string to match, will only include matchings files |

## Example Quickstart and Live Demo

The following HTML code...

```html
<div data-plugin="cms:pagelist" data-type="posts" data-layout="post-list-embed" data-link="posts/subproject/">Loading Content...</div>
```

will render...

<div data-plugin="cms:pagelist" data-type="posts" data-layout="post-list-embed" data-link="posts/subproject/">Loading Content...</div>
