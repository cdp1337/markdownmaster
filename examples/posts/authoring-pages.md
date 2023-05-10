---
title: Authoring Pages
author: Charlie Powell
tags: Howto, Markdown, Authoring
---

All pages in CMS.js are simply Markdown, but they do support a variety of nicities.


## Page Location

By default the CMS ships with `pages` and `posts` as content types.  Just create `.md` pages within those directories.  Other types of content can be added should you need to.  Subdirectories **ARE** supported, (but only a single level down).

A common usage (especially for posts), is to include a date string in the URL to organize them.  Else you will end up with a mess of files.

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

Article metadata is provided via a concept called "frontmatter", this is essentially just a block of content at the very start of an article wrapped with `---` tags.  This is beneficial for being able to set your article title, excerpt text, and other data.

To setup this metadata, include 3 dashes followed by each tag at the beginning of the article, for example:

```.md
---
title: Authoring Pages
author: Charlie Powell
tags: Howto, Markdown, Authoring
---
```

**Please note**, empty lines within the `---` lines **are not supported** and may prevent parsing of the fields.

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

Other attributes can be used, but will need to be added within your layout templates to make use of them.


## Page Headers

By default page headers (H1 elements) are rendered within the layout template for content based off metadata, so the inclusion of one is not necessary.

```.md
---
title: My Page
---

# My Page

...
```

This example will produce the following result because the page title is effectively defined twice:

```.html
<h1>My Page</h1>
<h1>My Page</h1>
```


## Page Content and Markdown

Since this is a _markdown_ content system, markdown syntax is used for writing the articles.  Refer to the [official markdown syntax](https://daringfireball.net/projects/markdown/syntax) for a refresher on details.


## Images

Images are supported within both the `image:...` metadata and from within article content.  These images can either be fully resolved or relatively resolved (relative to the file you are editing).

```.md
![test image](test-icon.gif)
```

Should display an image when rendered within the browser:

![test image](test-icon.gif)

This is because `test-icon.gif` is in the same directory as `authoring-pages.md` and can referenced easily.


## Extended Markdown Functionality

All base markdown features _should_ work, and a number of extended features have been added to better support web publishing.

### HTML Attributes

HTML attributes can be set on some elements, including:

* paragraphs
* links
* images

To use HTML attributes, append `{...}` to the end of the line with the HTML tags inside.
As some examples:

Short paragraph with `class="center"` added

```md
This is a short example paragraph {.center}
```

This link will have a `title` and `target` set

```md
[Go Search](https://www.duckduckgo.com) {title="Search for something" target=_blank}
```

This image will have a border

```md
![test image](test.png) {style="border:5px solid pink;"}
```

Any valid HTML tag can be used and CSS shorthand for class (`.` prefix) and ID (`#` prefix) are also supported.
