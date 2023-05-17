---
title: Layouts & Templates
author: Charlie Powell
tags: [Howto, HTML, Authoring]
---

Layouts in MarkdownMaster CMS are HTML files with just basic templating replacement 
features.  At the current version only two dynamic tags are supported.

## Variable Data

Data can be rendered from the source markdown file and its meta tags via `<%= ... %>`.

For example to display an image with an `alt` and `src` subkeys:

```html
<img src="<%= data.image.src %>" alt="<%= data.image.alt %>"/>
```

## If Statements

Blindly expecting data to be present in the source file can be dangerous as the author 
may not have added those keys.  In the example of an image that image may not have any 
tags set.  As such it's recommended to use `if` blocks to check before trying to render:

```html
<% if (data.image) { %>
<img src="<%= data.image.src %>" alt="<%= data.image.alt %>"/>
<% } %>
```

## Real Examples

To look at real examples of layouts, take a look through `examples/layouts` at some of 
the provided default templates.

## Connecting Layouts

To connect a layout to a file, two options can be done.

### Default Type Layout

Each `type` can support a default layout as defined in `config.js`.  The two types of 
template uses are `list` and `single`.

### One-Off Layout

Each markdown file can define its own `single` layout template via the `layout` meta 
parameter.  This will override the site default for just that one file, (though 
multiple files can share the same layout).