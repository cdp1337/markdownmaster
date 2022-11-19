Apache2 can be used to host your own site, but needs a couple modules to be enabled for best results.

`rewrite` is required as it will allow URLs to be rewritten and resolved via the History API.  This will also perform rewrites for search crawlers to ensure they retrieve content when crawling the various .html links.

`include` is completely optional, and assists with templates with the `<!--#echo var=webpath -->` tag inside templates.  This allows the web path to change between installs without manually updating the path across all templates.  (@todo Candidate for removal, may switch to a different method due to nginx incompatibilities)

## Setup apache (tested on Debian/Ubuntu)

Enable the modules necessary and restart the web server.

`sudo a2enmod include rewrite; sudo systemctl restart apache2`

## Install Files

Extract the application, (including hidden `.htaccess` files) to `/var/www/html` (or other directory should you choose).

## Configure Environment

If your web application is installed in a directory OTHER than the default top-level path, edit `.htaccess` and set the 2 directives as necessary.  For example if your site is installed in `/var/www/html/mycms` and is retrieved via `https://domain.tld/mycms`, your `.htaccess` should resemble the following:

```.htaccess
    # Set these two lines to the value of config.webpath
	SetEnv webpath /mycms/
	RewriteBase /mycms/
```

## Configure Application

Follow standard steps for configuring the application via `js/config.js`.