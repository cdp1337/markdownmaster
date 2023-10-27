# Upgrade from 3.0 to 3.1

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
