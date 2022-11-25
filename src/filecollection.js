import { messages as msg, handleMessage } from './messages';
import { renderLayout } from './templater';
import { get, isValidFile, getGithubUrl, getFilenameFromPath } from './utils';
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
    this[type] = this.files;
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
      this.loadFiles((success, error) => {
        if (error) handleMessage(msg['GET_FILE_ERROR']);
        callback();
      });
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
   * Get file elements.
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
    window.CMS.debuglog('Scanning directory', directory);

    get(directory, (success, error) => {
      if (error) callback(success, error);

      // find the file elements that are valid files, exclude others
      this.getFileElements(success).forEach((file) => {
        var fileUrl = this.getFileUrl(file, this.config.mode, directory);
        window.CMS.debuglog('Found link ' + file + ' => ' + fileUrl);

        if (isValidFile(fileUrl, this.config.extension)) {
          // Regular markdown file
          window.CMS.debuglog('Adding ' + fileUrl + ' to collection ' + this.type);
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
        }
      });

      this.directoriesScanned++;

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
    this[this.type] = this.files;
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
      this[this.type].sort(param);
    } else {
      let direction = 1;
      if (param.match(/-r$/)) {
        direction = 0;
        param = param.substring(0, param.length - 2);
      }

      this[this.type].sort((a, b) => {
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
    this[this.type] = this[this.type].filter((file) => {
      return file.matchesSearch(search);
    });
  }

  /**
   * Filter content to display by a tag
   * @method
   * @param {string} query - Search query.
   * 
   * @todo Refactor to "filterByTag" (nothing is actually returned here)
   * @todo Support multiple filters
   */
  filterTag(query) {
    this[this.type] = this[this.type].filter((file) => {
      if (query && file.tags) {
        return file.tags.some((tag) => {
          return tag === query;
        });
      }
    });
  }

  /**
   * Filter results by a URL regex
   * 
   * @param {string} url URL fragment/regex to filter against
   * 
   * @todo Support multiple filters
   */
  filterPermalink(url) {
    this[this.type] = this[this.type].filter((file) => {
      let fileUrl = file.permalink.substring(this.config.webpath.length);
      return fileUrl.match(url);
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
      if (file.tags) {
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
    return renderLayout(this.layout.list, this.config, this, callback);
  }

}

export default FileCollection;
