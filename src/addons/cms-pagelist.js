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

export default class CMSPagelistElement extends HTMLElement {
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

		if (['layout', 'link', 'sort', 'type'].indexOf(name) !== -1 && oldValue !== newValue) {
			// Only re-render if an actionable attribute is modified
			this._render();
		}
	}

	/**
	 * Execute the plugin on a given node to render the requested content inside it
	 */
	_render() {
		let type = this.getAttribute('type'),
			layout = this.getAttribute('layout'),
			sort = this.getAttribute('sort'),
			filters = {},
			has_filters = false,
			collection;

		if (type === null) {
			return;
		}

		collection = window.CMS.getCollection(type);
		if (collection === null) {
			return;
		}

		// To allow the user to specify multiple attributes for the same field,
		// ie: author = ['bob', 'alice']
		for (let i = 0; i < this.attributes.length; i++) {
			let ak = this.attributes[i].name, av = this.attributes[i].value;
			if (ak.indexOf('filter-') === 0) {
				// Starts with "filter-..., denotes a filter to add to the query"
				// Trim the prefix, so we have just the field the user is filtering
				// Numbers at the beginning of the filter key are only present to
				// allow duplicate keys in the HTML node, so we can skip filter-123 too.
				ak = ak.replace(/^filter-([0-9]+)?/, '');
				has_filters = true;

				if (Object.hasOwn(filters, ak) && !Array.isArray(filters[ak])) {
					// Key already set, ensure it's an array
					filters[ak] = [filters[ak]];
				}

				if (Object.hasOwn(filters, ak)) {
					filters[ak].push(av);
				} else {
					filters[ak] = av;
				}
			}
		}

		if (layout === null) {
			// Default for this collection
			layout = collection.layout.list;
		}

		// Reset any filters previously set on this collection
		collection.resetFilters();

		// User-request sort and filter parameters
		if (sort !== null) {
			collection.filterSort(sort);
		}
		if (has_filters) {
			collection.filterAttributeSearch(filters);
		}

		window.CMS.renderLayout(layout, collection)
			.then(html => {
				this.innerHTML = html;
			})
			.catch(error => {
				console.error('Unable to render <cms-pagelist> template [' + layout + ']', error);
			});
	}
}
