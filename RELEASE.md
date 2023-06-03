# (Next Version Tagline / Name)


## New Features

* #18 support pagination for listing pages
* #19 support for cms-icon (convenience helper) 

## Fixes

* #20 cms-search preserves search query
* #21 hash URLs were taking over route events


## Changes




## Upgrade from 2.x

Since this has been a substantial rewrite, some features will require updating, 
(depending on what is used on your specific site).

### URLs

Page URLs have been changed from query hashes to full standard URLs via the History API. 
This requires a new `.htaccess` or `nginx.conf` to be installed 
(depending on the server you chose).  Consult the respective file within `examples/`.

### Plugins

Plugins have been retooled and need refactored to work correctly. 
Given the default example plugin:

```js
// 2.x Example plugin
function myPlugin() {
	// Do some code
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

```js
// 3.x+ plugin
blog.registerPlugin(
  'myPlugin', 
  {
    init: () => {
      // Do some code
      console.log('loading test plugin');
    }
  }
);

// Access the loaded plugins like this.
blog.getPlugin('myPlugin');
```

### onload/onroute

The configurable options `onload` and `onroute` are still supported, 
but this functionality has been ported to the following code:

```js
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


## Upgrade from 3.0.x

1. Configure `cgi-bin/config.ini` with values that mimic `js/config.js`
2. Upload `cgi-bin` to your server
3. Add new directives from `nginx.conf` into your site config
4. Run the following code (with the appropriate SITEPATH)

```bash
apt install fcgiwrap python3 python3-venv
python3 -m venv /opt/markdownmaster
/opt/markdownmaster/bin/pip3 install Markdown beautifulsoup4 python-frontmatter lxml
chmod +x "${SITEPATH}/cgi-bin/crawler.py"
chmod +x "${SITEPATH}/cgi-bin/sitemap.py"
chmod +x "${SITEPATH}/cgi-bin/meta.py"
```


## Upgrade from 3.1.x

---

Tags and other lists in Markdown files now expect to be YAML-compatible lists

* `tags: blah, foo` => `tags: [blah, foo]`
* Dates listed as `date: 2023-01-01` will be rendered as Date objects,
switch to `date: '2023-01-01'` (with quotes) for best results

---

Banners and images no longer auto-resolve as URLs, instead `src` or `href` needs to be
used in YAML data

* `banner: somefile.jpg` => `banner: { src: somefile.jpg }`

---

Moved some plugins to built-in

* `site.enablePlugin(['pagelist'])` => N/A (built-in)
* `site.enablePlugin(['search'])` => N/A (built-in)
* `site.enablePlugin(['remarkable'])` NEW RENDERER

---