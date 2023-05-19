---
title: CMS Author Tag
---

Tag to render an Author snippet to be embedded on another page

## Requirements

* A content type of `authors` must exist in your site
* Author pages must have a `title` attribute
* Author pages must have an `alias` attribute

## Parameters

### author

The author name (title) or alias to search for

### layout

The template to use for rendering the author content

## Example

```html
<% if(data.author) { %>
    <cms-author author="<%= data.author %>" layout="author-embed"><%= data.author %></cms-author>
<% } %>
```