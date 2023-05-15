Apache2 can be used to host your own site, but needs a module to be enabled for best results.

`rewrite` is required as it will allow URLs to be rewritten and resolved via the History API.  This will also perform rewrites for search crawlers to ensure they retrieve content when crawling the various .html links.


## Setup apache (tested on Debian/Ubuntu)

Enable the modules necessary and restart the web server.

`sudo a2enmod rewrite; sudo systemctl restart apache2`

## Install Files

Extract the application, (including hidden `.htaccess` files) to `/var/www/html` (or other directory should you choose).

## Configure Environment

If your web application is installed in a directory OTHER than the default top-level path, edit `.htaccess` and set the `RewriteBase` directive as necessary.  For example if your site is installed in `/var/www/html/mycms` and is retrieved via `https://domain.tld/mycms`, your `.htaccess` should resemble the following:

```.htaccess
  # Set this line to the value of config.webpath
	RewriteBase /mycms/
```

## Configure Application

Follow standard steps for configuring the application via `js/config.js`.