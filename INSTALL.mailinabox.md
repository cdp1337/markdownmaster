Mail-in-a-box + Nextcloud can be used to host your own site and provides very rapid access to update/manage your site thanks to Nextcloud.

This guide starts with the expectation that your mail-in-a-box instance is already up and running.

## Install Files

Select a location in your Nextcloud instance to host the files, for example `Sync/domain.tld/site` or some such.  Extract the files to this directory to be auto-deployed to your Mail-in-a-box instance.  (Take note of the path, that will be useful in the next step.)


## Setup Environment (tested on Ubuntu 22.04)

With version 3.1.x some server-side CGI scripts are needed to optimize SEO visibility and crawler access.  While not strictly required this is rather beneficial for public sites.  These scripts are executed from the fastcgi wraper helper daemon.

```.sh
sudo apt install fcgiwrap
```

Mail-in-a-box hosts web sites via `/home/user-data/www`.  Create a symlink to the location created when deploying the files, for example

```.sh
sudo ln -s /home/user-data/owncloud/myusername/files/domain.tld/site /home/user-data/www/domain.tld
```

This will create a link from your auto-deployed files to the webserver location so they are updated immediately upon saving/syncing changes.

Next, deploy the configuration file for mail-in-a-box to utilize.  This is included in `nginx.conf`.

```.sh
sudo ln -s /home/user-data/www/domain.tld/nginx.conf /home/user-data/www/domain.tld.conf
```

Next, log into mail-in-a-box admin's interface and ensure your `domain.tld` site is added as a DNS record that points to your server.  This will inform MIAB to setup your site and link to the directory created.  Once done, just run `sudo /root/mailinabox/tools/web_update` or initiate the web update via the web interface to rebuild the nginx configuration and pull your custom config.


## Configure Server

Starting with version 3.1.x nginx requires a bit of configuration for server-side scripts to work.
[nginx.conf](examples/nginx.conf) contains 2 values which need set as well as the logic for the webserver for handling requests.

```
# Set $siteroot to the location of your site (needed for cgi-bin)
set $siteroot /home/user-data/www/yourdomain.tld;

# Set $sitedomain to the value of your domain (needed for logging)
set $sitedomain yourdomain.tld
```

At the top of nginx.conf will be listed 2 `set` directives.

* `$siteroot` needs to be the path where the site is installed
* `$sitedomain` should be the domain name or other identifier to use for logging

Once set, issue a restart for the changes to take effect, `sudo systemctl restart nginx`.


## Configure Application

Follow steps for configuring the web application and CGI application via [instructions within site-configuration](examples/posts/site-configuration.md).
