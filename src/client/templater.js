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

import {pathJoin} from './utils';
import CMSError from './cmserror';
import Log from './log';

let layout_path = '',
	system_container = null;

/**
 * Load template from URL.
 * @function
 * @async
 * @param {string} url - URL of template to load.
 * @param {object} data - Data to load into template.
 * @returns {Promise<string>}
 * @throws {CMSError}
 */
export async function loadTemplate(url, data) {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then(response => {
				if (!response.ok) {
					reject(new CMSError(response.status, response.statusText));
				}
				return response.text();
			})
			.then(tmpl => {
				let fn = new Function(
						'data',
						'var output=' +
						JSON.stringify(tmpl)
							.replace(/<%=(.+?)%>/g, '"+($1)+"')
							.replace(/<%(.+?)%>/g, '";$1\noutput+="') +
						';return output;'
					),
					html = '';

				try {
					html = fn.call(this, data); //renderer(data);
					resolve(html);
				} catch (e) {
					reject(new CMSError(500, e));
				}
			});
	});
}

/**
 * Fetch the layout and return in the resolve
 *
 * @async
 * @param {string} layout - Filename of layout.
 * @param {object} data - Data passed to template.
 * @returns {Promise<string>}
 * @throws {CMSError}
 */
export async function fetchLayout(layout, data) {
	return new Promise((resolve, reject) => {
		let url = pathJoin(layout_path, layout + '.html');
		loadTemplate(url, data)
			.then(html => {
				Log.Debug('Template', 'Fetched templated layout', url);
				resolve(html);
			})
			.catch(e => {
				Log.Error('Template', 'Error while rendered layout', url, e.message);
				reject(e);
			});
	});
}

/**
 * Renders the layout into the main container.
 *
 * @async
 * @param {string} layout - Filename of layout.
 * @param {object} data - Data passed to template.
 * @returns {Promise}
 * @throws {CMSError}
 */
export async function renderLayout(layout, data) {
	return new Promise((resolve, reject) => {
		fetchLayout(layout, data).then(html => {
			system_container.innerHTML = html;
			resolve();
		}).catch(e => {
			reject(e);
		});
	});
}

/**
 * Render an error to the browser
 *
 * @param {CMSError} error
 * @returns {Promise}
 */
export async function renderError(error) {
	return renderLayout('error' + error.code, {});
}

/**
 * Set the system layout directory (generally only called from the CMS)
 *
 * @param {string} args
 */
export function setSystemLayoutPath(...args) {
	layout_path = pathJoin(...args);
}

/**
 * Set the system layout directory (generally only called from the CMS)
 *
 * @param {HTMLElement} container
 */
export function setSystemContainer(container) {
	system_container = container;
}
