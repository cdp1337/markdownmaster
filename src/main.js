/**
 * MarkdownMaster CMS
 *
 * The MIT License (MIT)
 * Copyright (c) 2021 Chris Diana
 * https://chrisdiana.github.io/cms.js
 *
 * Copyright (c) 2023 Charlie Powell
 * https://github.com/cdp1337/markdownmaster
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Import base CMS
import CMS from './cms';

// Import marked and marked plugins
import {marked} from 'marked';
import customRenderer from './addons/marked.renderer';
import customTokenizer from './addons/marked.tokenizer';

// Import CMS plugins
import MastodonShare from './addons/mastodon_share';
import PageBodyClass from './addons/pagebodyclass';
import CMSSearchElement from './addons/cms-search';
import CMSAuthorElement from './addons/cms-author';
import CMSPagelistElement from './addons/cms-pagelist';
import CMSButtonElement from './addons/cms-button';


// Load marked addons
marked.use({
	extensions: [
		{
			name: 'link',
			renderer: customRenderer.link,
		},
		{
			name: 'image',
			renderer: customRenderer.image,
		},
	],
	renderer: {
		paragraph: customRenderer.paragraph,
	},
	tokenizer: customTokenizer
});

// Make available in global space
window.marked = marked;

// Load custom elements
customElements.define('cms-author', CMSAuthorElement);
customElements.define('cms-pagelist', CMSPagelistElement);
customElements.define('cms-search', CMSSearchElement, { extends: 'input' });
customElements.define('cms-button', CMSButtonElement, {extends: 'a'});

// Load addons
let systemPlugins = {
	mastodon_share: new MastodonShare(),
	pagebodyclass: new PageBodyClass()
};

export default (options) => new CMS(window, options, systemPlugins);
