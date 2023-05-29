"""
MarkdownMaster CMS

The MIT License (MIT)
Copyright (c) 2023 Charlie Powell
https://github.com/cdp1337/markdownmaster

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""

from simplesite import SimpleSite
import configparser
import os

_config = None


class SiteConfig:

    def __init__(self):
        self.path_root = os.path.realpath(os.path.join(os.path.realpath(__file__), '../../'))
        self.path_cgi = os.path.join(self.path_root, 'cgi-bin')
        self.path_config = os.path.join(self.path_cgi, 'config.ini')
        self.host = None
        self.path_web = None
        self.default_view = None
        self.types = []
        self.debug = False

    def load(self):

        try:
            config = configparser.ConfigParser()
            config.read(self.path_config)

            self.host = config['site']['host']
            self.path_web = config['site']['webpath']
            self.default_view = config['site']['defaultview']
            self.types = list(map(lambda x: x.strip(), config['site']['types'].split(',')))
            self.debug = config.getboolean('site', 'debug')
        except KeyError:
            SimpleSite.error('Server-side configuration not complete, please check cgi-bin/config.ini')

        if self.debug:
            # This will enable debug output to the browser
            import cgitb
            cgitb.enable()

    @classmethod
    def get_host(cls) -> str:
        """
        Get the fully resolved hostname, ie: "https://domain.tld"
        """
        return get_config().host

    @classmethod
    def get_path_root(cls) -> str:
        """
        Get the fully resolved top-level directory of the application and all content, ie: "/var/www/mysite"
        """
        return get_config().path_root

    @classmethod
    def get_path_cgi(cls) -> str:
        """
        Get the fully resolved path to the CGI application, ie: "/var/www/mysite/cgi-bin"
        """
        return get_config().path_cgi

    @classmethod
    def get_path_web(cls) -> str:
        """
        Get the web path of the root site, ie: "/"
        """
        return get_config().path_web

    @classmethod
    def get_default_view(cls) -> str:
        """
        Get the default view for the homepage, ie: "pages/home"
        """
        return get_config().default_view

    @classmethod
    def get_types(cls) -> list[str]:
        """
        Get a list of all types enabled, ie: ["posts", "pages"]
        """
        return get_config().types

    @classmethod
    def get_debug(cls) -> bool:
        """
        Get if DEBUG mode has been enabled for the server application
        """
        return get_config().debug

    @classmethod
    def get_home_url(cls) -> str:
        """
        Get the fully resolved URL of the homepage, ie: "https://domain.tld/pages/home.html"
        """
        c = get_config()
        return c.get_host() + os.path.join(c.get_path_web(), c.get_default_view() + '.html')


def get_config() -> SiteConfig:
    global _config
    if _config is None:
        _config = SiteConfig()
        _config.load()

    return _config


def get_config_for_tests() -> SiteConfig:
    """
    Get the system configuration, BUT DO NOT LOAD IT!
    This is useful for test cases where the configuration needs edited prior to loading.
    """
    global _config
    if _config is None:
        _config = SiteConfig()

    return _config
