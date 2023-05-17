---
title: CMS Document-level Events
author: Charlie Powell
tags: [Howto, Configuration]
---

For extendability, several events are dispatched at the document level of the page. 
This allows custom script to tie into events regardless of where they are defined.

## Event cms:load

Dispatched immediately upon successful initialization of the CMS

**Parameters**

* event.detail.cms: The CMS object passed for reference

**Example**

```javascript
/**
 * Called immediately upon successful initialization of the CMS
 * 
 * @param {CMS}  
 */
document.addEventListener('cms:load', event => {
  event.detail.cms.debuglog('CMS initialized and ready to run user-specific code!', event.detail.cms);
});
```


## Event cms:route

Dispatched after any page load operation

**Parameters**

* event.detail.cms: The CMS object passed for reference
* event.detail.collection: Collection of files to view for listing pages
* event.detail.file: Single file to view when available
* event.detail.mode: Type of view, usually either "list", "single", or error.
* event.detail.search: Any search query
* event.detail.tag: Any tag selected to view
* event.detail.type: Content type selected

**Example**

```javascript
/**
 * Called after any page load operation
 * 
 * @param {CMS} event.detail.cms CMS object for reference if needed
 * @param {FileCollection[]|null} event.detail.collection Collection of files to view for listing pages
 * @param {File|null} event.detail.file Single file to view when available
 * @param {string} event.detail.mode Type of view, usually either "list", "single", or error.
 * @param {string} event.detail.search Any search query
 * @param {string} event.detail.tag Any tag selected to view
 * @param {string} event.detail.type Content type selected
 */
document.addEventListener('cms:route', event => {
  event.detail.cms.debuglog('Page being displayed', event.detail);
});
```
