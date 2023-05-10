---
title: Sorting
author: Charlie Powell
tags: Howto, Configuration, Authoring
---

Version 3.1.0 introduces new sorting parameters for use in site configuration and plugins.


## Common Parameters

| Sort Key    | Sort Description               |
|-------------|--------------------------------|
| title       | Page Title A -> Z              |
| title-r     | Page Title Z -> A              |
| datetime    | Date Modified Oldest -> Newest |
| datetime-r  | Date Modified Newest -> Oldest |
| name        | Filename A -> Z                |
| name-r      | Filename Z -> A                |
| permalink   | URL A -> Z                     |
| permalink-r | URL Z -> A                     |


## Sorting in Configuration

`js/config.js` allows you to specify a default sort for various file types.  Listed below is an example where posts are sorted NEW to OLD and pages are listed A to Z.

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
```


## Advanced Usage

Beyond the common attributes, any [page custom meta field](authoring-pages.md#page-meta-data) can be used for sorting, along with the '-r' suffix for "reversed" sorting.

From within the configuration, a function can be provided for completely custom functionality, for example to default to randomly sorted articles:

```.js
sort: (a, b) => { return Math.floor(Math.random() * 10) % 2; },
```