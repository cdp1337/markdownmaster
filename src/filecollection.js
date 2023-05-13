/**
 * CMS.js - Handler for the discrete groups of markdown files
 *
 * The MIT License (MIT)
 * Copyright (c) 2021 Chris Diana
 * https://chrisdiana.github.io/cms.js
 *
 * Copyright (c) 2023 Charlie Powell
 * https://github.com/cdp1337/cms.js
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

import { messages as msg, handleMessage } from './messages';
import { renderLayout } from './templater';
import { get, getGithubUrl, getFilenameFromPath } from './utils';
import File from './file';

/**
 * Represents a file collection.
 * @constructor
 * @param {string} type - The type of file collection (i.e. posts, pages).
 * @param {object} layout - The layouts of the file collection type.
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
   * Initialize file collection.
   * @method
   * @async
   * @param {function} callback - Callback function
   */
  init(callback) {
    this.getFiles((success, error) => {
      if (error) handleMessage(msg['DIRECTORY_ERROR']);

      if (this.files.length > 0) {
        // Only try to load the files if the scan actually found files to load.
        // Otherwise callback() is just never invoked.
        this.loadFiles((success, error) => {
          if (error) handleMessage(msg['GET_FILE_ERROR']);
          callback();
        });
      } else {
        // No files, just jump straight to the callback.
        callback();
      }
      
    });
  }

  /**
   * Get file list URL.
   * @method
   * @param {string} type - Type of file collection.
   * @returns {string} URL of file list
   */
  getFileListUrl(type, config) {
    return (config.mode === 'GITHUB') ? getGithubUrl(type, config.github) : this.config.webpath + type;
  }

  /**
   * Get file URL.
   * @method
   * @param {object} file - File object.
   * @returns {string} File URL
   */
  getFileUrl(file, mode, type) {
    if (mode === 'GITHUB') {
      return file['download_url'];
    } else {
      let href = getFilenameFromPath(file.getAttribute('href'));
      if (href[0] === '/') {
        // Absolutely resolved paths should be returned unmodified
        return href;
      } else {
        // Relatively linked URLs get appended to the parent directory
        if (type[type.length - 1] === '/') {
          // parent directory ends in a trailing slash
          return type + href;
        } else {
          // No trailing slash, so adjust as necessary
          return type + '/' + href;
        }
      }
    }
  }

  /**
   * Get list of file elements from either the returned listing page scan (or JSON data for GITHUB)
   * 
   * @param {object} data - File directory or Github data.
   * @returns {array} File elements
   */
  getFileElements(data) {
    var fileElements;

    // Github Mode
    if (this.config.mode === 'GITHUB') {
      fileElements = JSON.parse(data);
    }
    // Server Mode
    else {
      // convert the directory listing to a DOM element
      var listElement = document.createElement('div');
      listElement.innerHTML = data;
      // get the links in the directory listing
      fileElements = [].slice.call(listElement.getElementsByTagName('a'));
    }
    return fileElements;
  }

  /**
   * Get files from file listing and set to file collection.
   * @method
   * @async
   * @param {function} callback - Callback function
   */
  getFiles(callback) {
    this.directories = [this.getFileListUrl(this.type, this.config)];

    this.scanDirectory(callback, this.directories[0], true);
  }

  /**
   * Perform the underlying directory lookup
   * @method
   * @async
   * @param {function} callback - Callback function
   * @param {string} directory - Directory URL to scan
   * @param {boolean} recurse - Set to FALSE to prevent further recursion
   */
  scanDirectory(callback, directory, recurse) {
    window.CMS.debuglog('[' + this.type + '] Scanning directory', directory);

    get(directory, (success, error) => {
      if (error) callback(success, error);

      // find the file elements that are valid files, exclude others
      this.getFileElements(success).forEach((file) => {
        var fileUrl = this.getFileUrl(file, this.config.mode, directory);
        
        if (
          // Skip top-level path
          fileUrl !== this.config.webpath &&
          // Must be a file on this site
          fileUrl.indexOf(this.config.webpath) === 0 &&
          // Must end with the extension configured
          fileUrl.endsWith(this.config.extension)
        ) {
          // Regular markdown file
          window.CMS.debuglog('[' + this.type + '] Found valid file, adding to collection', {original: file.href, parsed: fileUrl});
          this.files.push(new File(fileUrl, this.type, this.layout.single, this.config));
        } else if (
          // Allow recurse to be disabled
          recurse && 
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
          this.directories.push(fileUrl);
          this.scanDirectory(callback, fileUrl, false);
        } else {
          window.CMS.debuglog('[' + this.type + '] Skipping invalid link', {original: file.href, parsed: fileUrl});
        }
      });

      this.directoriesScanned++;
      window.CMS.debuglog('[' + this.type + '] Scanning of ' + directory + ' complete (' + this.directoriesScanned + ' of ' + this.directories.length + ')');

      if (this.directoriesScanned === this.directories.length) {
        callback(success, error);
      }
    });
  }

  /**
   * Load files and get file content.
   * @method
   * @async
   * @param {function} callback - Callback function
   */
  loadFiles(callback) {
    var promises = [];
    // Load file content
    this.files.forEach((file, i) => {
      file.loadContent((success, error) => {
        if (error) callback(success, error);
        promises.push(i);
        file.parseContent();
        // Execute after all content is loaded
        if (this.files.length == promises.length) {
          callback(success, error);
        }
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
   * @param {object|string|null} param A function, string, or empty value to sort by
   */
  filterSort(param) {
    if (typeof(param) === 'undefined' || param === null) {
      param = this.layout.sort || 'title';
    }

    if (typeof(param) === 'object') {
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
   * @method
   * @param {string} search - Search query.
   */
  filterSearch(search) {
    this.entries = this.entries.filter((file) => {
      return file.matchesSearch(search);
    });
  }

  /**
   * Search file collection by arbitrary attributes
   *
   * @see {@link File#matchesAttributeSearch} for full documentation of usage
   * @param {Object} search Dictionary containing key/values to search
   * @param {string} mode   "OR" or "AND" if we should check all keys or any of them
   */
  filterAttributeSearch(search, mode) {
    mode = mode || 'AND';

    this.entries = this.entries.filter((file) => {
      return file.matchesAttributeSearch(search, mode);
    });
  }

  /**
   * Filter content to display by a tag
   * @method
   * @param {string} query - Search query.
   */
  filterTag(query) {
    this.entries = this.entries.filter((file) => {
      return file.matchesAttributeSearch({tags: query});
    });
  }

  /**
   * Filter results by a URL regex
   * 
   * @param {string} url URL fragment/regex to filter against
   */
  filterPermalink(url) {
    this.entries = this.entries.filter((file) => {
      return file.matchesAttributeSearch({permalink: '~ ' + url + '.*'});
    });
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
          }
          else {
            // Existing tag
            tags[pos].count ++;
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
   */
  getFileByPermalink(permalink) {

    window.CMS.debuglog('Retrieving file by permalink', permalink);

    let foundFiles = this.files.filter((file) => {
      return file.permalink === permalink || 
        file.permalink === this.config.webpath + permalink;
    });

    if (foundFiles.length === 0) {
      throw 'Requested file could not be located';
    }
    
    return foundFiles[0];
  }

  /**
   * Renders file collection.
   * @method
   * @async
   * @returns {string} Rendered layout
   */
  render(callback) {
    if (this.layout.title) {
      document.title = this.layout.title;
    } else {
      document.title = 'Listing';
    }
    renderLayout(this.layout.list, this.config, this, callback);
  }

}

export default FileCollection;
