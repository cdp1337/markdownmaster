from bs4 import BeautifulSoup


class Templater:
    def __init__(self, template: str):
        """
        Initialize a new Template, using the specified file as the base of the template

        :param template: Filename of template to load
        :throws FileNotFoundError:
        """
        with open(template) as fp:
            self.soup = BeautifulSoup(fp, 'lxml')

    def set_title(self, title: str):
        """
        Set the page SEO title
        :param title: Page title to set
        """
        # Set the base title
        try:
            self.soup.title.string = title
        except AttributeError:
            # does not exist yet
            tag = self.soup.new_tag('title')
            tag.string = title
            self.soup.head.append(tag)

        # And set the supplemental titles (opengraph and the like)
        self.set_meta_content('og:title', title)

    def set_description(self, desc: str):
        """
        Set the meta description for this page
        :param desc: Meta description
        """
        # Just set the various metas for this key
        self.set_meta_content('description', desc, 'name')
        self.set_meta_content('og:description', desc)

    def set_canonical(self, href: str):
        """
        Set the canonical link for this page
        :param href: Fully resolved URL
        """
        try:
            self.soup.head.find('link', {'rel': 'canonical'})['href'] = href
        except TypeError:
            # Does not exist
            tag = self.soup.new_tag('link', attrs={'rel': 'canonical', 'href': href})
            self.soup.head.append(tag)

    def set_body(self, body: str):
        """
        Set the body content for this page, will render into <div id="cms"/>
        :param body: HTML content of body
        """
        # Since soup only likes to deal with full Objects and not strings,
        # we will build a new Soup object based off the incoming fragment
        frag = BeautifulSoup(body, 'html.parser')
        target = self.soup.find('div', {'id': 'cms'})
        target.append(frag)

    def set_meta_content(self, key: str, content: str, prop: str = 'property'):
        try:
            self.soup.head.find('meta', {prop: key})['content'] = content
        except TypeError:
            # Does not exist
            tag = self.soup.new_tag('meta', attrs={prop: key, 'content': content})
            self.soup.head.append(tag)

    def __str__(self):
        """
        Fetch this rendered template as an HTML string, ready for direct output to the browser

        (Just calls str(soup)...)
        """
        return str(self.soup)
