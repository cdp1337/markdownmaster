# _Promise_ it's 2023?

Completely overhaul the entire CMS to implement a modern and more 
powerful asynchronous system for everything, Promises.
This removes the need to keep track of callback functions everywhere
and offloads that work to the browser instead.

## New Features

Images, links, and paragraphs now support {...} format of inline text
to define custom HTML parameters for rendered elements.
Support CSS-style selectors and any valid HTML attribute,
(including quoted text).

* New support for HTML attributes inline
* Add text/title support to URLs in frontcontent
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
* URL parameters now support 'title | url_of_asset' format in FrontMatter


## Fixes

* Do not include DRAFT pages in taglist
* Fix beginning newline on sitemap
* Fix for FrontMatter overwriting functions
* Fix parsing of files with no FrontMatter
* Fix bug where images inside anchors were not dispatching the router


## Changes

*BREAKING CHANGE* URL-type properties now return "label" and "url", 
with the label being the text prior to the URL, 
separated by a vertical pipe '|'. 
This allows pages to make use of URL in buttons or alt text for images
Copy the dateFormat, listAttributes, and urlAttribute declarations 
into the default configuration file for easier editing by admins. 
The date also switched to locale-aware defaults.

* Removed Github support (it was broken anyway on this fork)
* Switch to new Configuration system
* Switch to Promises for async operations






## Upgrade from 3.1.x to NEXT


## Upgrade from 3.0.x to 3.1.x

1. Install the fast CGI wrapper on your server, `sudo apt install fcgiwrap`
2. Configure `cgi-bin/config.ini` with values that mimic `js/config.js`
3. Upload `cgi-bin` to your server
4. If necessary, ensure the scripts are executable, `chmod +x cgi-bin/{crawler,sitemap}.py`
5. Add new directives from `nginx.conf` into your site config (new version has some configurable parameters at the top)


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