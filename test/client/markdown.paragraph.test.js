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

import {describe, expect, it, jest, test} from '@jest/globals';
import renderer from '../../src/client/addons/loader-remarkable';


describe('markdown-paragraph', () => {
	it('basic', () => {
		let txt = 'This is a simple paragraph',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p>This is a simple paragraph</p>');
	});
	it('embedded tokens', () => {
		let txt = 'Check out [this thing](https://example.tld) for examples',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p>Check out <a href="https://example.tld">this thing</a> for examples</p>');
	});
	it('extended attributes', () => {
		let txt = 'I should be centered {.center}',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p class="center">I should be centered</p>');
	});
	it('only paragraphs are paragraphs', () => {
		let txt = `# Test Suite

I should be centered {.center}

* key
* blah
`,
			html = renderer(txt);
		expect(html.trim()).toEqual(`<h1 id="test-suite">Test Suite</h1>
<p class="center">I should be centered</p>
<ul>
<li>key</li>
<li>blah</li>
</ul>`);
	});
});
