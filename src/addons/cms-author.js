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
 * <cms-author> element definition
 */
export default class CMSAuthorElement extends HTMLElement {
	static get observedAttributes() {
		return ['author', 'layout'];
	}

	constructor() {
		// Always call super first in constructor
		super();
		this._render();

		// Initially when loaded, ignore any attribute change requests
		this.settled = false;
		setTimeout(() => {
			this.settled = true;
		}, 200);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.settled) {
			// The CMS will sometimes load the DOM, then reload when adding to the page.
			// Prevent double-loading on pageload
			return;
		}
		if (['author', 'layout'].indexOf(name) !== -1 && oldValue !== newValue) {
			// Only re-render if an actionable attribute is modified
			this._render();
		}
	}

	_render() {
		let author = this.getAttribute('author'),
			layout = this.getAttribute('layout'),
			collection,
			results;

		// This module requires both an author and the authors component to be loaded.
		// Since this is a live component which watches attributes, this should be done
		// before any CMS work is checked to save cycles
		if (!author) {
			return;
		}
		if (!layout) {
			return;
		}

		// Load the collection from the CMS
		collection = window.CMS.getCollection('authors');
		if (!collection) {
			window.CMS.log.Warn('cms-author', '<cms-author> tag requires an "authors" collection to be available');
			return;
		}

		// Search for this user
		collection.resetFilters();
		collection.filterAttributeSearch({title: author, alias: author}, 'OR');
		results = collection.entries;

		// Only render if at least one found, (just pick the first)
		if (results.length >= 1) {
			window.CMS.fetchLayout(layout, results[0])
				.then(html => {
					this.innerHTML = html;
				}).catch(error => {
					window.CMS.log.Error('cms-author', 'Unable to render <cms-author> template [' + layout + ']', error);
				});
		} else {
			window.CMS.log.Warn('cms-author', 'No author could be found matching [' + author + ']');
		}
	}
}
