Version 3.x features a nearly completely rewrite of all core concepts of this utilty and a large number of features and bugfixes implemented.

## New Features

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


## Upgrade from 2.x to 3.x

Since this has been a substantial rewrite, some features will require updating, (depending on what is used on your specific site).

### URLs

Page URLs have been changed from query hashes to full standard URLs via the History API.  This requires a new `.htaccess` or `nginx.conf` to be installed (depending on the server you chose).  Consult the respective file within `examples/`.

### Plugins

Plugins have been retooled and need refactored to work correctly.  Given the default example plugin:

```.js
// Example plugin
function myPlugin() {
	console.log('loading test plugin');
}

// Config
var config = {
  
  // ...
  
  // Pass in any custom functions or plugins here and access the CMS object.
  plugins: [
  	myPlugin,
  ],

  // ...

  // This function will be called once the CMS instance is loaded and ready.
  onload: function() {
    
    // ...

    // Access the loaded plugins like this.
    blog.myPlugin();
  },
};
```

This example plugin would need to be rewritten to:

```.js
blog.registerPlugin(
  'myPlugin', 
  {
    init = () => {
      console.log('loading test plugin');
    }
  }
);

// Access the loaded plugins like this.
blog.getPlugin('myPlugin');
```

### onload/onroute

The configurable options `onload` and `onroute` are still supported, but this functionality has been ported to the following code:

```.js
/**
 * Called immediately upon successful initialization of the CMS
 * 
 * @param {CMS} event.detail.cms The CMS object passed for reference
 */
document.addEventListener('cms:load', event => {
  event.detail.cms.debuglog('CMS initialized and ready to run user-specific code!', event.detail.cms);
});

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