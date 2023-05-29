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

import json
from typing import Union


class SimpleSite:
    TYPE_HTML = 'text/html'
    TYPE_XML = 'text/xml'
    TYPE_JSON = 'application/json'

    type: str = ''

    @classmethod
    def _pre_render(cls) -> None:
        """
        Perform checks and any work necessary prior to rendering a page, called automatically
        """
        if cls.type not in [SimpleSite.TYPE_HTML, SimpleSite.TYPE_XML, SimpleSite.TYPE_JSON]:
            # Type not one of the supported registered types, remap to a supported one
            cls.type = cls.TYPE_HTML

    @classmethod
    def error(cls, message: str, code: int = 500) -> None:
        """
        Render an error to the user to indicate something happened
        """

        cls._pre_render()

        code_names = {
            404: 'Not Found',
            500: 'Server Error',
        }

        try:
            text = code_names[code]
        except KeyError:
            cls.error('Unsupported redirect code requested, ' + str(code))

        if cls.type == SimpleSite.TYPE_XML:
            template = '''
            <?xml version="1.0"?>
            <xml><error>%s</error></xml>
            '''
        else:
            template = '''
            <!DOCTYPE html>
            <html>
            <head>
            <style>body { text-align: center; color: #990000; font-weight: bold;}</style>
            </head>
            <body>%s</body>
            </html>
            '''

        print('HTTP/1.1 ' + str(code) + ' ' + text)
        print('Content-Type: ' + cls.type)
        print('Status: ' + str(code))
        print()
        print(template % message)
        exit()

    @classmethod
    def redirect(cls, path: str, code: int = 301) -> None:
        """
        Render a crawler-compliant redirect along with the requested redirect type
        """

        cls._pre_render()

        code_names = {
            301: 'Moved Permanently',
            302: 'Found',
            303: 'See Other',
            307: 'Temporary Redirect',
            308: 'Permanent Redirect',
        }

        try:
            text = code_names[code]
        except KeyError:
            cls.error('Unsupported redirect code requested, ' + str(code))

        if cls.type == SimpleSite.TYPE_XML:
            template = '''
            <?xml version="1.0"?>
            <xml><redirect type="%s">%s</redirect></xml>
            '''
        else:
            template = '''
            <!DOCTYPE html>
            <html>
            <head>
            <style>body { text-align: center; font-weight: bold;}</style>
            </head>
            <body>%s: <a href="%s">Content is available here</a></body>
            </html>
            '''

        print('HTTP/1.1 ' + str(code) + ' ' + text)
        print('Content-Type: ' + cls.type)
        print('Status: ' + str(code))
        print('Location: ' + path)
        print()
        print(template % (text, path))
        exit()

    @classmethod
    def render(cls, payload: Union[str, dict, list]) -> None:
        """
        Render a full page
        :param payload: str | dict | list
        """
        cls._pre_render()

        print('HTTP/1.1 200 OK')
        print('Content-Type: ' + cls.type)
        print()
        if cls.type == cls.TYPE_JSON:
            print(json.dumps(payload))
        else:
            print(payload)
        exit()
