/**
 * MarkdownMaster CMS
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

/**
 * <cms-mastodon-share> element definition
 */
export default class CMSMastodonShareElement extends HTMLAnchorElement {

	constructor() {
		// Always call super first in constructor
		super();

		this.addEventListener('click', evt => {
			let href = window.localStorage.getItem('mastodon-instance') || '';
			href = prompt('Enter your mastodon instance URL', href);

			if (href) {
				// Ensure it's fully resolved
				if (href.indexOf('://') === -1) {
					href = 'https://' + href;
				}

				// Remember this for next time
				window.localStorage.setItem('mastodon-instance', href);

				window.open(
					href + '/share/?text=' + encodeURIComponent('Check out ' + document.title + ' on ' + window.location.host + '\n\n' + window.location.href),
					'_blank',
					'popup=true,noopener,width=400,height=450'
				);
			}

			evt.preventDefault();
		});
	}
}
