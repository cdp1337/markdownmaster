---
author: Charlie Powell
tags: [Howto, Markdown, Authoring]
---

# Extended Markdown Functionality

All base markdown features will work, and a number of extended features have
been added to better support web publishing.

## HTML Attributes

HTML attributes can be set on some elements, including:

* paragraphs
* links
* images

To use HTML attributes, append `{...}` to the end of the line with the HTML tags inside.
As some examples:

Short paragraph with `class="center"` added

```markdown
This is a short example paragraph {.center}
```

This link will have a `title` and `target` set.
Since both paragraphs and links support extended attributes, try to ensure
no space between the link and curly brace.

```md
[Go Search](https://www.duckduckgo.com){title="Search for something" target=_blank}
```

This image will have a border

```markdown
![test image](test.png){style="border:5px solid pink;"}
```

### Valid Attributes and Shorthand

Below is a list of attributes and shorthand versions,
but ANY HTML ATTRIBUTE is supported.

| Attribute  | Description             | Example                            |
|------------|-------------------------|------------------------------------|
| "." prefix | Shorthand for class=... | `{.center}`                        |
| "#" prefix | Shorthand for id=...    | `{#myid}`                          |
| style      | CSS style attributes    | `{style="border:5px solid pink;"}` |
| title      | Title attribute         | `{title="My Title"}`               |
| target     | Target attribute        | `{target=_blank}`                  |
| data-*     | Data attributes         | `{data-foo="bar"}`                 |
