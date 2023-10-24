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

    STATUS_CODES = {
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',
        103: 'Early Hints',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        207: 'Multi-Status',
        208: 'Already Reported',
        226: 'IM Used',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy Deprecated',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Payload Too Large',
        414: 'URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Range Not Satisfiable',
        417: 'Expectation Failed',
        418: 'I\'m a teapot',
        421: 'Misdirected Request',
        422: 'Unprocessable Content',
        423: 'Locked',
        424: 'Failed Dependency',
        425: 'Too Early',
        426: 'Upgrade Required',
        428: 'Precondition Required',
        429: 'Too Many Requests',
        431: 'Request Header Fields Too Large',
        451: 'Unavailable For Legal Reasons',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
        506: 'Variant Also Negotiates',
        507: 'Insufficient Storage',
        508: 'Loop Detected',
        510: 'Not Extended',
        511: 'Network Authentication Required'
    }

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
    def _header(cls, code: int = 200, headers: dict = {}) -> None:

        cls._pre_render()

        print('Content-Type: ' + cls.type)
        print('Status: ' + str(code))
        for h in headers:
            print(h + ': ' + headers[h])
        print()

    @classmethod
    def error(cls, message: str, code: int = 500) -> None:
        """
        Render an error to the user to indicate something happened
        """
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

        cls._header(code)
        print(template % message)
        exit()

    @classmethod
    def redirect(cls, path: str, code: int = 301) -> None:
        """
        Render a crawler-compliant redirect along with the requested redirect type
        """
        try:
            text = cls.STATUS_CODES[code]
        except KeyError:
            text = 'Redirect'

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

        cls._header(code, {'Location': path})
        print(template % (text, path))
        exit()

    @classmethod
    def render(cls, payload: Union[str, dict, list]) -> None:
        """
        Render a full page
        :param payload: str | dict | list
        """
        cls._header(200)
        if cls.type == cls.TYPE_JSON:
            print(json.dumps(payload))
        else:
            print(payload)
        exit()
