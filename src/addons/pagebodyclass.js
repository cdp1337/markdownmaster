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

/**
 * Automatically manages classes to the body based on the current page being viewed
 */
export default class {
	constructor() {
		// Used to track dynamic classes when browsing between pages
		this.classes = [];
		// Navigation link data, if set will be used to update link classes
		this.navLinks = [];
		// Navigation target selector, passed to querySelectorAll
		this.navSelector = '';
		// Set to the class name to denote links as "active"
		this.navActiveClass = 'active';
	}

	init() {
		/**
		 * Called after any page load operation
		 *
		 * When using function() syntax, 'this' will point to the CMS object,
		 * arrow function syntax 'site.onroute = () => { ... }' will be anonymous and detached.
		 *
		 * Either option is acceptable, just depending on your needs/preferences.
		 * @method
		 * @param {FileCollection[]|null} view.collection Collection of files to view for listing pages
		 * @param {File|null} view.file Single file to view when available
		 * @param {string} view.mode Type of view, usually either "list", "single", or error.
		 * @param {string} view.query Any search query
		 * @param {string} view.tag Any tag selected to view
		 * @param {string} view.type Content type selected
		 */
		document.addEventListener('cms:route', e => {
			this.updateBody(e.detail);

			if (this.navSelector !== '' && this.navLinks.length > 0) {
				this.updateNavigation();
			}
		});
	}

	updateBody(routeData) {
		let newClasses = [],
			remClasses = [];

		if (routeData.type && routeData.mode) {
			newClasses.push(['page', routeData.type, routeData.mode].join('-'));

			if (routeData.search) {
				newClasses.push(['page', routeData.type, 'search'].join('-'));
			}

			if (routeData.tag) {
				newClasses.push(['page', routeData.type, 'tag'].join('-'));
			}

			if (routeData.file) {
				// Translate the file URL to a valid class name
				// Omit the web path prefix
				let fileTag = routeData.file.permalink.substring(routeData.cms.config.webpath.length);
				// Omit the file extension (.html)
				fileTag = fileTag.substring(0, fileTag.length - 5)
					// Replace slashes with dashes
					.replaceAll('/', '-')
					// Lowercase
					.toLowerCase();

				newClasses.push('page-' + fileTag);
			}
		}

		// Strip classes which are no longer needed on the body.
		// These are handled in bulk to minimize the number of CSS rendering required by the engine
		this.classes.forEach(c => {
			if (newClasses.indexOf(c) === -1) {
				remClasses.push(c);
			}
		});

		if (remClasses.length > 0) {
			document.body.classList.remove(...remClasses);
		}

		if (newClasses.length > 0) {
			document.body.classList.add(...newClasses);
		}

		// Remember the dynamic classes for the next pageload so they can be removed if necessary
		// otherwise browsing through different pages will simply keep adding more and more class tags.
		this.classes = newClasses;
	}

	updateNavigation() {
		document.querySelectorAll(this.navSelector).forEach(nav => {
			nav.querySelectorAll('.' + this.navActiveClass).forEach(el => {
				el.classList.remove(this.navActiveClass);
			});

			this.navLinks.forEach(l => {
				if (typeof (l[0]) === 'string') {
					// Simple check
					if (document.body.classList.contains(l[0])) {
						nav.querySelector(l[1]).classList.add('active');
					}
				} else {
					// Complex/regex check
					let match = false;
					document.body.classList.forEach(c => {
						if (c.match(l[0]) !== null) {
							match = true;
						}
					});
					if (match) {
						nav.querySelector(l[1]).classList.add('active');
					}
				}
			});
		});

	}
}
