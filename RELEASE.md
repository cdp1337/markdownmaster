# Google Evidently Hates Markdown

Version 3.1.0 features server-side scripts to better assist with crawler visibility, as evidently Google will refuse to fully index markdown content.
The two included server scripts are:

* Sitemap generator
* Crawler-friendly md-to-html generator


## Changes

* New server-side scripts to better support crawlers and bots
* Refactor internal method names to be more consistent to their actions
* Fix support for sorting of articles
* Add support for sorting in the page-list plugin
* Add support for multiple filters to be applied at a time
* Add support for lazy-loading markdown content in articles
* Add support for custom URL-type attributes in frontmatter


## Upgrade from 3.0.0 to 3.1.0

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