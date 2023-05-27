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

export default class CMSButtonElement extends HTMLAnchorElement {

	static get observedAttributes() {
		return ['prefix', 'icon'];
	}

	constructor() {
		// Always call super first in constructor
		super();

		// write element functionality in here
		// Create a shadow root
		const icon = document.createElement('i'),
			span = document.createElement('span');
		let icon_prefix = 'fa';

		// Move the contents of the 'A' node to a new span (to play nicely along side an icon)
		span.innerHTML = this.innerHTML;
		this.innerHTML = '';
		span.setAttribute('part', 'content');

		// Allow the user to select a different prefix, ie: using something other than fontawesome
		if (this.hasAttribute('prefix') && this.getAttribute('prefix')) {
			icon_prefix = this.getAttribute('prefix');
		}

		if (this.hasAttribute('icon') && this.getAttribute('icon')) {
			icon.classList.add(icon_prefix, icon_prefix + '-' + this.getAttribute('icon'));
			icon.setAttribute('part', 'icon');
			this.appendChild(icon);
		}

		this.classList.add('button');
		this.appendChild(span);
	}
}
