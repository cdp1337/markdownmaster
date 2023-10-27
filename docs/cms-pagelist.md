---
title: CMS Page List
---

Render a list of pages which match given parameters.

**Parameters**

| Parameter | Required | Example                | Description                                                         |
|-----------|----------|------------------------|---------------------------------------------------------------------|
| type      | yes      | "posts,pages,etc"      | Any valid content type defined on your site                         |
| layout    | no       | "post-list"            | Layout to use for rendering content, useful for controlling UX      |
| link      | no       | "^posts/subproject/.+" | Regex or regular string to match, will only include matchings files |
| sort      | no       | "datetime-r"           | Sort results by a specific key                                      |
| limit     | no       | 5                      | Limit the number of results returned                                |
| filter-*  | no       | "filter-tag"           | Filter results by a specific key                                    |

**Example**

```.html
<div 
    is="cms-pagelist" 
    type="pages" 
    layout="page-list" 
    link="pages/games/" 
    sort="title" 
    limit="5"
>
  Loading Content...
</div>
```
