## 4.0.0 - UNRELEASED

## New Features

* New support for HTML attributes inline
* dateFormat, listAttributes, & urlAttributes config
* Include Prism.JS as an extra for sites
* Include FontAwesome as an extra for sites
* Better error management
* Better logging support
* Better support for external scripts
* Add fetchLayout and renderLayout
* Add support for filtering files by date published
* New convenience method CMS.getCollection
* New support for complex filtering of files
* Add CMS-Author tag for embedded author snippet
* Add CMS-Button tag for stylized buttons from a-elements
* URLs in FrontMatter now support multiple values


## Fixes

* Do not include DRAFT pages in taglist
* Fix beginning newline on sitemap
* Fix for FrontMatter overwriting functions
* Fix parsing of files with no FrontMatter
* Fix bug where images inside anchors were not dispatching the router
* FrontMatter now correctly handles YAML parsing


## Changes

* Removed Github support (it was broken anyway on this fork)
* Switch to new Configuration system
* Switch to Promises for async operations
* Move CMS-Pagelist to a standardized customElement
* Move CMS-Search to a standardized customElement
* URL-type properties now require `src` or `href` subattributes
* The date formatting by default is now locale-aware


## 3.1.0 - 2022-11-24

author: cdp1337

Version 3.1.0 features server-side scripts to better assist with crawler visibility, as evidently Google will refuse to fully index markdown content.
The two included server scripts are sitemap generator and a crawler-friendly site renderer.

### New Features

* New server-side scripts to better support crawlers and bots
* Add support for sorting in the page-list plugin
* Add support for multiple filters to be applied at a time
* Add support for lazy-loading markdown content in articles
* Add support for custom URL-type attributes in frontmatter

### Fixes

* Fix support for sorting of articles
* Refactor internal method names to be more consistent to their actions


## 3.0.0 - 2022-11-22

author: cdp1337

Version 3.x features a nearly completely rewrite of all core concepts of this utilty and a large number of features and bugfixes implemented.

### New Features

* Better debug logging support
* Switch to History API for page navigation
* Include SEO and crawler support via rewrite rules
* Add support for nested directories
* Add support for subdirectory web paths
* Add support for SEO page titles
* Add support for automatic change timestamps
* Fix support for images in meta attributes
* Add support for full text searching
* Add support for retrieving tags for an entire collection
* Add support for dynamic body classes
* Include marked.js for better markdown support
* Better nginx support
* Fix image URLs relative to the markdown source file in meta tags
* Retool plugin functionality
* Add several plugins to core system


## 2.0.0 - 2018-11-21

author: chrisdiana

* Zero dependencies (no more jQuery or Marked)
* Abstract types
* Boilerplate separated from source code
* Custom Templates
* Tagging
* Filtering
* Search
* Sorting
* Events
* Streamlined Config
* Updated Github & Server Mode
* Extendable Plugins
* Extendable Markdown Renderer
* Small size footprint


## 1.0.0 2016-01-20

author: chrisdiana

* Initial release