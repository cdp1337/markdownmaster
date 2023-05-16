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

import {renderLayout} from './templater';
import {pathJoin} from './utils';
import File from './file';
import Log from './log';
import CMSError from './cmserror';

/**
 * Represents a file collection.
 * @constructor
 * @param {string} type   The type of file collection (i.e. posts, pages).
 * @param {Object} layout The layouts of the file collection type.
 * @param {Object} config Configuration from the CMS
 */
class FileCollection {

	constructor(type, layout, config) {
		this.type = type;
		this.layout = layout;
		this.config = config;
		this.files = [];
		this.directories = [];
		this.entries = this.files;
		this.directoriesScanned = 0;
	}

	/**
	 * Initialize file collection
	 *
	 * @async
	 * @returns {Promise}
	 */
	async init() {
		return new Promise((resolve) => {
			this.getFiles().then(() => {
				this.loadFiles().then(() => {
					resolve();
				});
			});
		});
	}

	/**
	 * Get file list URL
	 *
	 * @returns {string} URL of file list
	 */
	getFileListUrl() {
		console.log(this);
		return pathJoin(this.config.webpath, this.type);
	}

	/**
	 * Get file URL.
	 * @method
	 * @param {string} href      File href attribute as retrieved from the server
	 * @param {string} directory Directory this file was retrieved from
	 * @returns {string} File URL
	 */
	getFileUrl(href, directory) {
		if (href.startsWith('/')) {
			// Absolutely resolved paths should be returned unmodified
			return href;
		} else {
			return pathJoin(directory, href);
		}
	}

	/**
	 * Get list of file elements from either the returned listing page scan (or JSON data for GITHUB)
	 *
	 * @param {object|string} data - File directory or Github data.
	 * @returns {string[]} File elements
	 */
	getFileElements(data) {
		let fileElements = [];

		// Github Mode
		if (this.config.mode === 'GITHUB') {
			fileElements = JSON.parse(data);
		}
		// Server Mode
		else {
			// convert the directory listing to a DOM element
			let listElement = document.createElement('div');
			listElement.innerHTML = data;
			// get the valid links in the directory listing
			listElement.querySelectorAll('a').forEach(el => {
				let href = el.getAttribute('href');
				if (href !== '../' && (href.endsWith(this.config.extension) || href.endsWith('/'))) {
					fileElements.push(href);
				}
			});
		}

		return fileElements;
	}

	/**
	 * Get files from file listing and set to file collection.
	 * @method
	 * @async
	 * @returns {Promise}
	 */
	async getFiles() {
		return new Promise((resolve) => {
			// Scan the top-level directory first
			this.scanDirectory(this.getFileListUrl())
				.then(directories => {
					// THEN scan any child directory discovered to allow for 1-level depth paths
					let promises = [];
					for (let dir of directories) {
						promises.push(this.scanDirectory(dir));
					}
					if (promises.length > 0) {
						Promise.all(promises)
							.then(() => {
								resolve();
							});
					} else {
						// No additional directories found, resolve immediately.
						resolve();
					}
				});
		});
	}

	/**
	 * Perform the underlying directory lookup
	 * @method
	 * @async
	 * @param {string} directory   Directory URL to scan
	 * @returns {Promise<string[]>} Array of subdirectories found
	 */
	async scanDirectory(directory) {
		Log.Debug(this.type, 'Scanning directory', directory);

		return new Promise((resolve) => {
			fetch(directory)
				.then(response => {
					return response.text();
				})
				.then(contents => {
					let directories = [];

					this.getFileElements(contents).forEach(file => {
						let fileUrl = this.getFileUrl(file, directory);

						if (
							// Skip top-level path
							fileUrl !== this.config.webpath &&
							// Must be a file on this site
							fileUrl.indexOf(this.config.webpath) === 0 &&
							// Must end with the extension configured
							fileUrl.endsWith(this.config.extension)
						) {
							// Regular markdown file
							Log.Debug(this.type, 'Found valid file, adding to collection', {directory, file, fileUrl});
							this.files.push(new File(fileUrl, this.type, this.layout.single, this.config));
						} else if (
							// Only iterate when not in github mode
							this.config.mode !== 'GITHUB' &&
							// skip checking '?...' sort option links
							fileUrl[fileUrl.length - 1] === '/' &&
							// skip top-level path
							fileUrl !== this.config.webpath &&
							// skip parent directory links, we're going DOWN, not UP
							fileUrl.indexOf('/../') === -1
						) {
							// in SERVER mode, support recursing ONE directory deep.
							// Allow this for any directory listing NOT absolutely resolved (they will just point back to the parent directory)
							directories.push(fileUrl);
						} else {
							Log.Debug(this.type, 'Skipping invalid link', {directory, file, fileUrl});
						}
					});

					Log.Debug(this.type, 'Scanning of ' + directory + ' complete');
					resolve(directories);
				});
		});
	}

	/**
	 * Load files and get file content.
	 * @method
	 * @async
	 * @returns {Promise}
	 */
	async loadFiles() {
		return new Promise((resolve) => {
			let promises = [];

			this.files.forEach((file) => {
				promises.push(file.loadContent());
			});

			// Once all files have been loaded, notify the parent
			Promise.allSettled(promises).then(() => {
				resolve();
			});
		});
	}

	/**
	 * Reset filters and sorting
	 */
	resetFilters() {
		this.entries = this.files;
	}

	/**
	 * Sort results by a given parameter
	 *
	 * If a function is requested, that is used to sort the results.
	 * If a string is requested, only specific keywords are supported.  Use -r to inverse results.
	 * If NULL is requested, the default sort for this collection type is used.
	 *
	 * @param {object|string|null} [param=null] A function, string, or empty value to sort by
	 */
	filterSort(param) {
		if (typeof (param) === 'undefined' || param === null) {
			param = this.layout.sort || 'title';
		}

		if (typeof (param) === 'object') {
			this.entries.sort(param);
		} else {
			let direction = 1;
			if (param.match(/-r$/)) {
				direction = 0;
				param = param.substring(0, param.length - 2);
			}

			this.entries.sort((a, b) => {
				if (direction === 1) {
					return a[param] >= b[param];
				} else {
					return a[param] <= b[param];
				}
			});
		}
	}

	/**
	 * Search file collection by attribute.
	 *
	 * @param {string} search - Search query.
	 */
	filterSearch(search) {
		Log.Debug(this.type, 'Performing text search for files', search);

		this.entries = this.entries.filter((file) => {
			return file.matchesSearch(search);
		});
	}

	/**
	 * Search file collection by arbitrary attributes
	 *
	 * @see {@link File#matchesAttributeSearch} for full documentation of usage
	 * @param {Object} search Dictionary containing key/values to search
	 * @param {string} [mode=AND]   "OR" or "AND" if we should check all keys or any of them
	 */
	filterAttributeSearch(search, mode) {
		mode = mode || 'AND';

		Log.Debug(this.type, 'Performing "' + mode + '" attribute search for files', search);

		this.entries = this.entries.filter((file) => {
			return file.matchesAttributeSearch(search, mode);
		});
	}

	/**
	 * Filter content to display by a tag (Convenience method)
	 *
	 * @see filterAttributeSearch
	 *
	 * @param {string} query - Search query.
	 */
	filterTag(query) {
		this.filterAttributeSearch({tags: query});
	}

	/**
	 * Filter results by a URL regex (Convenience method)
	 *
	 * @see filterAttributeSearch
	 *
	 * @param {string} url URL fragment/regex to filter against
	 */
	filterPermalink(url) {
		this.filterAttributeSearch({permalink: '~ ' + url + '.*'});
	}

	/**
	 * Get all tags located form this collection
	 *
	 * Each set will contain the properties `name`, `count`, and `url`
	 *
	 * @returns {Object[]}
	 */
	getTags() {
		let tags = [],
			tagNames = [];

		this.files.forEach(file => {
			if (!file.draft && file.tags) {
				file.tags.forEach(tag => {
					let pos = tagNames.indexOf(tag);
					if (pos === -1) {
						// New tag discovered
						tags.push({
							name: tag,
							count: 1,
							url: this.config.webpath + this.type + '.html?tag=' + encodeURIComponent(tag)
						});
						tagNames.push(tag);
					} else {
						// Existing tag
						tags[pos].count++;
					}
				});
			}
		});

		return tags;
	}

	/**
	 * Get file by permalink.
	 * @method
	 * @param {string} permalink - Permalink to search.
	 * @returns {File} File object.
	 * @throws {CMSError}
	 */
	getFileByPermalink(permalink) {

		Log.Debug(this.type, 'Retrieving file by permalink', permalink);

		let foundFiles = this.files.filter((file) => {
			return file.permalink === permalink ||
				file.permalink === this.config.webpath + permalink;
		});

		if (foundFiles.length === 0) {
			throw new CMSError(404, 'Requested file could not be located');
		}

		return foundFiles[0];
	}

	/**
	 * Renders file collection.
	 *
	 * @async
	 * @returns {Promise}
	 * @throws {Error}
	 */
	async render() {

		// Rendering a full page will update the page title
		if (this.layout.title) {
			document.title = this.layout.title;
		} else {
			document.title = 'Listing';
		}

		return renderLayout(this.layout.list, this);
	}

}

export default FileCollection;
