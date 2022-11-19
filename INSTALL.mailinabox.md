Mail-in-a-box + Nextcloud can be used to host your own site and provides very rapid access to update/manage your site thanks to Nextcloud.

## Install Files

Select a location in your Nextcloud instance to host the files, for example `Sync/domain.tld/site` or some such.  Extract the files to this directory to be auto-deployed to your Mail-in-a-box instance.  (Take note of the path, that will be useful in the next step.)


## Setup Environment (tested on Ubuntu 22.04)

Mail-in-a-box hosts web sites via `/home/user-data/www`.  Create a symlink to the location created when deploying the files, for example

```.sh
sudo ln -s /home/user-data/owncloud/myusername/files/domain.tld/site /home/user-data/www/domain.tld
```

This will create a link from your auto-deployed files to the webserver location so they are updated immediately upon saving/syncing changes.

Next, deploy the configuration file for mail-in-a-box to utilize.  This is included in `nginx.conf`.

```.sh
sudo cp /home/user-data/www/domain.tld/nginx.conf /home/user-data/www/domain.tld.conf
```

Next, log into mail-in-a-box admin's interface and ensure your `domain.tld` site is added as a DNS record that points to your server.  This will inform MIAB to setup your site and link to the directory created.  Once done, just run `sudo /root/mailinabox/tools/web_update` or initiate the web update via the web interface to rebuild the nginx configuration and pull your custom config.


## Configure Application

Follow standard steps for configuring the application via `js/config.js`.