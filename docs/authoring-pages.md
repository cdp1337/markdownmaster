---
author: Charlie Powell
tags: [Howto, Markdown, Authoring]
---

# Authoring Pages

All pages in MarkdownMaster CMS are simply Markdown, but they do support a variety of nicities.


## Page Location

By default, the CMS ships with `pages` and `posts` as content types. 
Just create `.md` pages within those directories. 
Other types of content can be added should you need to. 
Subdirectories **ARE** supported, (but only a single level down).

A common usage (especially for posts), is to group files by date published
to better organize them, otherwise you will end up with a mess of files and assets.

The following directory structure examples will all provide the same automatic date string parsing from the URL.

```
 - posts/
    |- 2021-01-02-something.md
```

```
 - posts/
    |- 2021/
       |- 01-02-something.md
```

```
 - posts/
    |- 2021-01/
       |- 02-something.md
```

```
 - posts/
    |- 2021-01-02/
       |- something.md
```

## Page Meta Data

Article metadata is provided via 
[YAML](https://yaml.org/spec/1.2.2/#chapter-2-language-overview) 
markup at the beginning of each file inside `---` blocks.

It's important that the **very first line** is `---` and the section is closed by 
another `---` line to denote the end of the tags.

```.md
---
title: Authoring Pages
author: Charlie Powell
tags: [Howto, Markdown, Authoring]
---
```

### Tags and Lists of Values

To define a list of tags, wrap the tags with `[ ... ]` or list them on each line with a `-` prefix, 
for example these two will provide the same results:

```yaml
tags: [Howto, Markdown, Authoring]
```

```yaml
tags: 
  - Howto
  - Markdown
  - Authoring
```

### Images and URLs

For images and URLs where extra information may be needed, 
it is often beneficial to break them out into the various important tag.

```yaml
banner:
  src: images/page_banner.jpg
  alt: A banner image featuring something

call_to_action:
  href: https://mysite.tld
  title: Check Out My Cool Thing!
```


### Common Meta Attributes

| Attribute | Description                                                           |
|-----------|-----------------------------------------------------------------------|
| layout    | An alternative layout template for rendering this file                |
| title     | Title to use for H1 and on listing pages                              |
| seotitle  | Browser title to set when viewing the page                            |
| excerpt   | Short excerpt or description of this page to display on listing pages |
| date      | Date this article was published                                       |
| author    | Name of the author of this page                                       |
| tags      | Comma-separated list of tags for the content on this page             |
| image     | Fully resolve or relative path to preview image of this page          |

### Protected Attributes

DO NOT USE THESE! 
These are reserved for internal use only, but are available for use in your templates.

| Attribute   | Description                                                           |
|-------------|-----------------------------------------------------------------------|
| body        | The raw markdown content of this page                                 |
| bodyLoaded  | The rendered HTML content of this page                                |
| config      | The configuration object for this page                                |
| content     | The rendered HTML content of this page                                |
| name        | The filename of this page                                             |
| permalink   | The permalink of this page                                            |
| type        | The type of content this is (page, post, etc)                         |
| url         | The URL of this page                                                  |


Other attributes can be used, but will need to be added within your layout templates to make use of them.


## Page Headers

By default, page headers (H1 elements) are rendered within the layout template for content based off metadata, so 
the inclusion of one is not necessary.

```markdown
---
title: My Page
---

# My Page

...
```

This example will produce the following result because the page title is effectively defined twice:

```html
<h1>My Page</h1>
<h1>My Page</h1>
```


## Page Content and Markdown

Since this is a _markdown_ content system, markdown syntax is used for writing the articles.  Refer to the [official markdown syntax](https://daringfireball.net/projects/markdown/syntax) for a refresher on details.


## Images

Images are supported within both the `image:...` metadata and from within article content.  These images can either be fully resolved or relatively resolved (relative to the file you are editing).

```markdown
![test image](test-icon.gif)
```

Referencing images relative to the base file works because the browser will make the request 
relative to that file.  Top-level paths (starting with `/`) and absolute requests 
(`https://...`) paths are also supported.


