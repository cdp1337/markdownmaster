import configparser

class SimpleSite:

    TYPE_HTML = 'text/html'
    TYPE_XML = 'text/xml'

    def __init__(self) -> None:
        self.type = SimpleSite.TYPE_HTML

        # Load configuration and check values are set
        config = configparser.ConfigParser()
        config.read('config.ini')
        try:
            self.hostname = config['site']['host']
            self.path = config['site']['webpath']
            self.default = config['site']['defaultview']
            self.types = list(map(lambda x: x.strip(), config['site']['types'].split(',')))
            self.debug = config['site']['debug']

            if self.debug:
                # This will enable debug output to the browser
                import cgitb
                cgitb.enable()
        except KeyError:
            self.error('Server-side configuration not complete, please check cgi-bin/config.ini')
    
    def _preRender(self) -> None:
        if not self.type in [SimpleSite.TYPE_HTML, SimpleSite.TYPE_XML]:
            # Type not one of the supported registered types, remap to a supported one
            self.type = self.TYPE_HTML

    def error(self, message: str, code: int = 500) -> None:
        '''
        Render an error to the user to indicate something happened
        '''

        self._preRender()

        codeNames = {
            404: 'Not Found',
            500: 'Server Error',
        }

        try:
            text = codeNames[code]
        except KeyError:
            self.error('Unsupported redirect code requested, ' + str(code))
        
        if self.type == SimpleSite.TYPE_XML:
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
        print('Content-Type: ' + self.type)
        print('Status: ' + str(code))
        print()
        print(template % message)
        exit()

    def redirect(self, path: str, code: int = 301) -> None:
        '''
        Render a crawler-compliant redirect along with the requested redirect type
        '''

        self._preRender()

        codeNames = {
            301: 'Moved Permanently',
            302: 'Found',
            303: 'See Other',
            307: 'Temporary Redirect',
            308: 'Permanent Redirect',
        }

        try:
            text = codeNames[code]
        except KeyError:
            self.error('Unsupported redirect code requested, ' + str(code))
        
        if self.type == SimpleSite.TYPE_XML:
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
        print('Content-Type: ' + self.type)
        print('Status: ' + str(code))
        print('Location: ' + path)
        print()
        print(template % (text, path))
        exit()
    
    def render(self, payload: str) -> None:
        '''
        Render a full page
        '''
        self._preRender()

        print('HTTP/1.1 200 OK')
        print('Content-Type: ' + self.type)
        print()
        print(payload)
        exit()
