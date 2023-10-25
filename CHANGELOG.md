## 4.NEXT - 2023-XX-XX

### New Features

* Add 'random' as supported sort parameter
* Paginate now supports 'page' parameter
* Page-list now supports 'limit' parameter

### Fixes

* Fix cms-* plugins trying to run before CMS was initialized
* Switch example site to use minified version of app by default
* Include default config for Apache expiry headers (for caching)

### Changes

* Mastodon Share is now an element as opposed to a plugin


## 4.0.2 - 2023-10-23

### New Features

* Include a simple background-slider plugin
* Include fslightbox-basic for a simple lightbox

### Fixes

* Fix support for Apache web servers


## 4.0.1 - 2023-06-03

### New Features

* #18 support pagination for listing pages
* #19 support for cms-icon (convenience helper)

### Fixes

* #20 cms-search preserves search query
* #21 hash URLs were taking over route events


## 4.0.0 - 2023-06-03

### New Features

* New support for HTML attributes inline
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
* New support for sticky pages
* New support for multiple sort keys
* Include listing pages in sitemap.xml
* New server-side support for loading page metadata
* New debug parameters for DEBUG and crawlers
* Filecollection getTags now can sort and provide weighted values


### Fixes

* Do not include DRAFT pages in taglist
* Fix beginning newline on sitemap
* Fix for FrontMatter overwriting functions
* Fix parsing of files with no FrontMatter
* Fix bug where images inside anchors were not dispatching the router
* FrontMatter now correctly handles YAML parsing
* Fix listing pages for crawlers
* Fix draft pages from showing in sitemap.xml
* Add canonical URL to crawler pages
* Crawler pages now render the template to provide full links and previews
* Fix support for abbr tags in markdown


### Changes

* Removed Github support (it was broken anyway on this fork)
* Switch to new Configuration system
* Switch to Promises for async operations
* Move CMS-Pagelist to a standardized customElement
* Move CMS-Search to a standardized customElement
* URL-type properties now require `src` or `href` subattributes
* The date formatting by default is now locale-aware
* Switched default markdown renderer from marked to remarkable


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