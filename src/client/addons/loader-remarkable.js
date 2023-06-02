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

import {Remarkable} from 'remarkable';
import p from './remarkable.paragraph';
import link from './remarkable.links';
import heading from './remarkable.heading';
import html from './remarkable.html';

let lib = new Remarkable('full', {
	html: true,        // Enable HTML tags in source
	xhtmlOut: true,    // Use '/' to close single tags (<br />)
	typographer: true  // Enable some language-neutral replacement + quotes beautification
});

lib.core.ruler.enable([
	'abbr'
]);
lib.block.ruler.enable([
	'footnote',
	'deflist'
]);
lib.inline.ruler.enable([
	'footnote_inline',
	'ins',
	'mark',
	'sub',
	'sup'
]);

lib.use(p);
lib.use(link);
lib.use(heading);
lib.use(html);


// Export the renderer function
export default (markdown) => { return lib.render(markdown); };

// Export the core library for reference if needed
export {lib};
