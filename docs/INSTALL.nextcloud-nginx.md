# Install Guide for NextCloud on Nginx

## Requirements

* SSH access to your NextCloud server
* `sudo` access for updating system files
* Basic terminal experience to copy/paste commands

## 1. Add files to NextCloud

Download and extract `examples/` in the latest `.tar.gz` release from 
[Github](https://github.com/cdp1337/markdownmaster/releases) to a directory
in your NextCloud sync path wherever you would like. 
For the example throughout this document, we will use `Sites/mysite.com` 
as the extracted directory and `mysite.com` as your site URL, 
but the exact location is completely up to you.

It _is_ recommended to use your site URL as the directory name to contain the site.

Your files should now look like:

```
Sync/
 |- Sites/
   |- mysite.com/
     |- index.html
     |- nginx.conf
     |- css/
     |- js/
```

## 2. Configure Nginx

SSH to your NextCloud instance and run the auto-install script as sudo or root

```bash
sudo bash <(curl -s https://raw.githubusercontent.com/cdp1337/markdownmaster/main/scripts/install.nextcloud-nginx.sh)
```

**Disclaimer**, it's a security risk to run unknown code from the internet as sudo!
Always download and inspect scripts prior to running them on production servers,
(_but the above command will just run it if you are lazy_).