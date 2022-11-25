import defaults from './defaults';
import FileCollection from './filecollection';
import { messages as msg, createMessageContainer, handleMessage } from './messages';
import { getParameterByName } from './utils';
import { renderLayout } from './templater';

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
    this.state;
    this.view = view;
    this.config = Object.assign({}, defaults, options);
    this.plugins = plugins;
    this.pluginsInitialized = [];

    // Link to window for global functions
    view.CMS = this;
  }

  /**
   * Generic function to assist with debug logging without needing if ... everywhere.
   * @param  {...any} args mixed arguments to pass
   */
  debuglog(...args) {
    if (this.config.debug) {
      console.log(...args);
    }
  }

  /**
   * Init
   * @method
   * @description
   * Initializes the application based on the configuration. Sets up up config object,
   * hash change event listener for router, and loads the content.
   */
  init() {
    this.debuglog('Initializing CMS.js');

    // create message container element if debug mode is enabled
    if (this.config.debug) {
      createMessageContainer(this.config.messageClassName);
    }
    if (this.config.elementId) {
      // setup container
      this.config.container = document.getElementById(this.config.elementId);

      this.view.addEventListener('click', (e) => {
        if (e.target && e.target.nodeName === 'A') {
          this.listenerLinkClick(e);
        }
      });

      if (this.config.container) {
        // setup file collections
        this.initFileCollections(() => {
          // check for hash changes
          this.view.addEventListener('hashchange', this.route.bind(this), false);
          // AND check for location.history changes (for SEO reasons)
          this.view.addEventListener('popstate', () => { this.route(); });
          // start router by manually triggering hash change
          //this.view.dispatchEvent(new HashChangeEvent('hashchange'));

          // Backwards compatibility with 2.0.1 events
          if (this.config.onload && typeof(this.config.onload) === 'function') {
            document.addEventListener('cms:load', () => { this.config.onload(); });
          }
          if (this.config.onroute && typeof(this.config.onroute) === 'function') {
            document.addEventListener('cms:route', () => { this.config.onroute(); });
          }

          this.route();
          // register plugins and run onload events
          this.ready = true;
          this.debuglog('System plugins available:', Object.keys(this.plugins));
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
   * @param {Event} e Click event from user
   */
  listenerLinkClick(e) {
    let targetHref = e.target.href;

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
   * @method
   * @async
   */
  initFileCollections(callback) {
    var promises = [];
    var types = [];

    // setup collections and routes
    this.config.types.forEach((type) => {
      this.collections[type.name] = new FileCollection(type.name, type.layout, this.config);
      types.push(type.name);
    });

    // init collections
    types.forEach((type, i) => {
      this.collections[type].init(() => {
        this.debuglog('Initialized collection ' + type);
        promises.push(i);
        // Execute after all content is loaded
        if (types.length == promises.length) {
          callback();
        }
      });
    });
  }

  /**
   * Retrieve the current path URL broken down into individual pieces
   * @returns {array} The segments of the URL broken down by directory
   */
  getPathsFromURL() {
    let paths = window.location.pathname.substring(this.config.webpath.length).split('/');

    if (paths.length >= 1 && paths[0].substring(paths[0].length - 5) === '.html') {
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
    this.debuglog('Initializing routing');

    let paths = this.getPathsFromURL(),
      type = paths[0],
      filename = paths.splice(1).join('/'),
      collection = this.collections[type],
      search = getParameterByName('s') || '',
      tag = getParameterByName('tag') || '',
      mode = '',
      file = null;

    this.debuglog('Paths retrieved from URL:', {type: type, filename: filename, collection: collection});

    this.state = window.location.hash.substr(1);

    if (!type) {
      // Default view
      this.historyReplaceState(this.config.webpath + this.config.defaultView + '.html');
      // route will be re-called immediately upon updating the state, so stop here.
      return;
    } else {
      // List and single views
      try {
        if (filename) {
          // Single view
          file = collection.getFileByPermalink([type, filename.trim()].join('/'));
          mode = 'single';
          file.render(() => {
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
          collection.render(() => {
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
        } else {
          throw 'Unknown request';
        }
      }
      catch (e) {
        mode = 'error';
        console.error(e);
        renderLayout(this.config.errorLayout, this.config, {}, () => {
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
    if (typeof(name) === 'string') {
      // Single plugin to enable, (expected behaviour)

      if (typeof(this.plugins[name]) === 'undefined') {
        // If the plugin is not registered, nothing to enable.
        console.error('Unable to load plugin "' + name + '", not registered as a valid plugin');
      } else if(this.pluginsInitialized.indexOf(name) !== -1) {
        // Plugin already initialized, don't double-init code to prevent unexpected issues
        console.warn('Plugin "' + name + '" already initialized, skipping init');
      } else {
        // Initialize the plugin, it'll handle whatever logic necessary.
        try {
          this.plugins[name].init();
          this.pluginsInitialized.push(name);
          this.debuglog('Initialized plugin "' + name + '"');
        } catch(e) {
          console.error('Unable to load plugin "' + name + '" due to an unhandled exception');
          this.debuglog(e);
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
    if (typeof(this.plugins[name]) === 'undefined') {
      // If the plugin is not registered, but return an Object so it doesn't completely break.
      console.error('Unable to retrieve plugin "' + name + '", not registered as a valid plugin');
      return new Object();
    } else {
      // Plugin located, return!
      return this.plugins[name];
    }
  }

  /**
    * Sort method for file collections.
    * @method
    * @param {string} type - Type of file collection.
    * @param {function} sort - Sorting function.
    */
  sort(type, sort) {
    if (this.ready) {
      this.collections[type][type].sort(sort);
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

}

export default CMS;
