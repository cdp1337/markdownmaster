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

import FileCollection from './filecollection';
import {messages as msg, createMessageContainer, handleMessage} from './messages';
import {
	renderLayout,
	setSystemLayoutPath,
	setSystemContainer,
	fetchLayout,
	renderError
} from './templater';
import Log from './log';
import CMSError from './cmserror';
import {Config} from './config';

/**
 * Represents a CMS instance
 */
class CMS {

	/**
	 * Instantiate a new CMS - the main interface for the site
	 *
	 * @param {window} view Window object
	 * @param {object} options Dictionary of configuration parameters to setup
	 * @param {object} plugins System plugins to provide by default
	 */
	constructor(view, options, plugins) {
		this.ready = false;
		/** @property FileCollection[] */
		this.collections = {};
		this.filteredCollections = {};
		this.view = view;
		this.config = new Config(options);
		this.plugins = plugins;
		this.pluginsInitialized = [];

		// Link to window for global functions
		view.CMS = this;

		// Allow the user to switch to debug mode, this will generate additional messages in the console
		if ((new URLSearchParams(document.location.search)).get('testdebug') === '1') {
			this.config.debug = true;
		}

		// Set up the layout system
		setSystemLayoutPath(this.config.webpath, this.config.layoutDirectory);

		// Set up the logger and a local link for external scripts to tap into easily
		this.log = Log;
		if (this.config.debug) {
			Log.EnableDebug();
		}
	}

	/**
	 * Init
	 * @method
	 * @description
	 * Initializes the application based on the configuration. Sets up config object,
	 * hash change event listener for router, and loads the content.
	 */
	init() {
		Log.Debug('CMS', 'Initializing MarkdownMaster CMS');

		// create message container element if debug mode is enabled
		if (this.config.debug) {
			createMessageContainer(this.config.messageClassName);
		}
		if (this.config.elementId) {
			// setup container
			this.config.container = document.getElementById(this.config.elementId);
			setSystemContainer(this.config.container);

			this.view.addEventListener('click', (e) => {
				if (e.target && e.target.closest('a')) {
					this.listenerLinkClick(e);
				}
			});

			if (this.config.container) {
				// setup file collections
				this.initFileCollections().then(() => {
					Log.Debug('CMS', 'File collections initialized');

					// check for hash changes
					this.view.addEventListener('hashchange', this.route.bind(this), false);
					// AND check for location.history changes (for SEO reasons)
					this.view.addEventListener('popstate', () => {
						this.route();
					});
					// start router by manually triggering hash change
					//this.view.dispatchEvent(new HashChangeEvent('hashchange'));

					// Backwards compatibility with 2.0.1 events
					if (this.config.onload && typeof (this.config.onload) === 'function') {
						document.addEventListener('cms:load', () => {
							this.config.onload();
						});
					}
					if (this.config.onroute && typeof (this.config.onroute) === 'function') {
						document.addEventListener('cms:route', () => {
							this.config.onroute();
						});
					}

					this.route();
					// register plugins and run onload events
					this.ready = true;
					Log.Debug('CMS', 'System plugins available:', Object.keys(this.plugins));
					document.dispatchEvent(new CustomEvent('cms:load', {detail: {cms: this}}));
				});
			} else {
				handleMessage(this.config.debug, msg['ELEMENT_ID_ERROR']);
			}
		} else {
			handleMessage(this.config.debug, msg['ELEMENT_ID_ERROR']);
		}
	}

	/**
	 * Handle processing links clicked, will re-route to the history for applicable links.
	 *
	 * @param {MouseEvent} e Click event from user
	 */
	listenerLinkClick(e) {
		let targetHref = e.target.closest('a').href;

		// Scan if this link was a link to one of the articles,
		// we don't want to intercept non-page links.
		this.config.types.forEach(type => {
			if (
				targetHref.indexOf(window.location.origin + this.config.webpath + type.name + '/') === 0 &&
				targetHref.substring(targetHref.length - 5) === '.html'
			) {
				// Target link is a page within a registered type path
				this.historyPushState(targetHref);
				e.preventDefault();
				return false;
			}

			if (targetHref.indexOf(window.location.origin + this.config.webpath + type.name + '.html') === 0) {
				// Target link is a listing page for a registered type path
				this.historyPushState(targetHref);
				e.preventDefault();
				return false;
			}
		});

		if (targetHref === window.location.origin + this.config.webpath) {
			// Target link is the homepage, this one can be handled too
			this.historyPushState(targetHref);
			e.preventDefault();
			return false;
		}

	}

	/**
	 * Initialize file collections
	 *
	 * @async
	 * @returns {Promise}
	 */
	async initFileCollections() {
		return new Promise((resolve) => {
			let promises = [];

			// setup collections and routes
			this.config.types.forEach((type) => {
				this.collections[type.name] = new FileCollection(type.name, type.layout, this.config);
				promises.push(this.collections[type.name].init());
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});
	}

	/**
	 * Retrieve the current path URL broken down into individual pieces
	 * @returns {string[]} The segments of the URL broken down by directory
	 */
	getPathsFromURL() {
		let paths = window.location.pathname.substring(this.config.webpath.length).split('/');

		if (paths.length >= 1 && paths[0].endsWith('.html')) {
			// First node (aka type) has HTML extension, just trim that off.
			// This is done because /posts needs to be browseable separately,
			// so we need a way to distinguish between that and the HTML version.
			paths[0] = paths[0].substring(0, paths[0].length - 5);
		}

		return paths;
	}

	/**
	 * REPLACE the window location, ONLY really useful on initial pageload
	 *
	 * Use historyPushState instead for most interactions where the user may click 'back'
	 * @param {string} url URL to replace
	 */
	historyReplaceState(url) {
		window.history.replaceState({}, '', url);
		// Immediately trigger route to switch to the new content.
		this.route();
	}

	historyPushState(url) {
		window.history.pushState({}, '', url);
		// Immediately trigger route to switch to the new content.
		this.route();
	}

	route() {
		Log.Debug('CMS', 'Running routing');

		let paths = this.getPathsFromURL(),
			type = paths[0],
			filename = paths.splice(1).join('/'),
			collection = this.getCollection(type),
			url = new URL(window.location),
			search = url.searchParams.get('s'),
			tag = url.searchParams.get('tag'),
			mode = '',
			file = null,
			renderer = null;

		Log.Debug('CMS', 'Paths retrieved from URL:', {type: type, filename: filename, collection: collection});

		if (!type) {
			// Default view
			// route will be re-called immediately upon updating the state
			this.historyReplaceState(this.config.webpath + this.config.defaultView + '.html');
		} else {
			// List and single views
			if (collection && filename) {
				// Single view
				try {
					file = collection.getFileByPermalink([type, filename.trim()].join('/'));
					mode = 'single';
					renderer = file.render();
				} catch (e) {
					mode = 'error';
					renderer = renderError(e);
				}
			} else if (collection) {
				// List view of some sort
				// All new page views start with fresh filters and default sorting
				collection.resetFilters();
				collection.filterSort();

				if (search) {
					// Check for queries
					collection.filterSearch(search);
				} else if (tag) {
					// Check for tags
					collection.filterTag(tag);
				}

				mode = 'listing';
				renderer = collection.render();
			} else {
				mode = 'error';
				renderer = renderError(new CMSError(404, 'Bad request or collection not found'));
			}

			if (renderer) {
				renderer.then(() => {
					Log.Debug('CMS', 'Page render complete, dispatching user-attachable event cms:route');
					document.dispatchEvent(
						new CustomEvent(
							'cms:route',
							{
								detail: {
									cms: this,
									type, file, mode, search, tag, collection
								}
							}
						)
					);
				}).catch(e => {
					// Try to render the error instead
					renderError(e).then(() => {
						Log.Debug('CMS', 'Page render failed, dispatching user-attachable event cms:route');
						mode = 'error';
						document.dispatchEvent(
							new CustomEvent(
								'cms:route',
								{
									detail: {
										cms: this,
										type, file, mode, search, tag, collection
									}
								}
							)
						);
					});
				});
			}
		}
	}

	/**
	 * Register and initialize a given plugin.
	 *
	 * Set up plugins based on user configuration.
	 *
	 * @param {string} name Plugin name to register
	 * @param {Object} plugin Plugin class to initialize
	 */
	registerPlugins(name, plugin) {
		if (this.pluginsInitialized.indexOf(name) !== -1) {
			// Only register a plugin if it has not already been initialized, to prevent unexpected issues
			console.error('Plugin "' + name + '" already initialized!  Unable to register override');
		} else {
			// Plugin not initialized yet, it can be safely loaded.
			this.plugins[name] = plugin;
			this.plugins[name].init();
			this.pluginsInitialized.push(name);
		}
	}

	/**
	 * Enable and initialize a plugin
	 *
	 * @param {string|array} name Name (or names) of plugin to enable and initialize
	 */
	enablePlugin(name) {
		if (typeof (name) === 'string') {
			// Single plugin to enable, (expected behaviour)

			if (typeof (this.plugins[name]) === 'undefined') {
				// If the plugin is not registered, nothing to enable.
				console.error('Unable to load plugin "' + name + '", not registered as a valid plugin');
			} else if (this.pluginsInitialized.indexOf(name) !== -1) {
				// Plugin already initialized, don't double-init code to prevent unexpected issues
				console.warn('Plugin "' + name + '" already initialized, skipping init');
			} else {
				// Initialize the plugin, it'll handle whatever logic necessary.
				try {
					this.plugins[name].init();
					this.pluginsInitialized.push(name);
					Log.Debug('CMS', 'Initialized plugin [' + name + ']');
				} catch (e) {
					Log.Error('CMS', 'Unable to load plugin [' + name + '] due to an unhandled exception', e);
				}

			}
		} else {
			// Support multiple plugins (just references back on the same method)
			name.forEach(n => {
				this.enablePlugin(n);
			});
		}
	}

	/**
	 * Get a registered plugin
	 *
	 * @param {string} name Plugin name to retrieve
	 * @returns {Object} Registered plugin
	 */
	getPlugin(name) {
		if (typeof (this.plugins[name]) === 'undefined') {
			// If the plugin is not registered, but return an Object so it doesn't completely break.
			console.error('Unable to retrieve plugin "' + name + '", not registered as a valid plugin');
			return new Object();
		} else {
			// Plugin located, return!
			return this.plugins[name];
		}
	}

	/**
	 * Get the given collection either by name or NULL if it does not exist
	 *
	 * @param {string} name
	 * @returns {FileCollection|null}
	 */
	getCollection(name) {
		return (Object.hasOwn(this.collections, name)) ? this.collections[name] : null;
	}

	/**
	 * Sort method for file collections.
	 * @method
	 * @param {string} type - Type of file collection.
	 * @param {function} sort - Sorting function.
	 */
	sort(type, sort) {
		if (this.ready) {
			this.collections[type].filterSort(sort);
			this.collections[type].render();
		} else {
			handleMessage(msg['NOT_READY_WARNING']);
		}
	}

	/**
	 * Search method for file collections.
	 * @method
	 * @param {string} type - Type of file collection.
	 * @param {string} attribute - File attribute to search.
	 * @param {string} search - Search query.
	 */
	search(type, search) {
		this.historyPushState(this.config.webpath + type + '.html?s=' + encodeURIComponent(search));
	}

	/**
	 * Pass-thru convenience function for external scripts to utilize the template engine
	 *
	 * @param {string} layout
	 * @param {Object} data
	 * @returns {Promise<string>}
	 */
	fetchLayout(layout, data) {
		return fetchLayout(layout, data);
	}

	/**
	 * Renders a layout with the set data
	 *
	 * @param {string} layout Base filename of layout to render
	 * @param {object} data Data passed to template.
	 * @returns {Promise} Returns rendered HTML on success or the error message on error
	 */
	renderLayout(layout, data) {
		return renderLayout(layout, data);
	}
}

export default CMS;
