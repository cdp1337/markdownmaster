/**
 * MarkdownMaster CMS
 *
 * The MIT License (MIT)
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

import {marked} from 'marked';
import customRenderer from './marked.renderer';
import customTokenizer from './marked.tokenizer';
/*
// Import marked and marked plugins
import {marked} from 'marked';
import abbr from './addons/marked-abbr';
import image from './addons/marked-image';
import link from './addons/marked-link';
import p from './addons/marked-paragraph';
*/

/*
// Load marked addons
marked.use({
	extensions: [
		abbr, image, link, p
	]
});
*/

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
		}
	],
	renderer: {
		paragraph: customRenderer.paragraph,
	},
	tokenizer: customTokenizer
});

// Export the renderer function
export default (markdown) => { return marked.parse(markdown); };

// Export the core library for reference if needed
export {marked};
