/**
 * CMS.js - File processor and handler for markdown files
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

import { renderLayout } from './templater';
import { get, extend, getDatetime} from './utils';
import Markdown from './markdown';

/**
 * Represents a Markdown file installed in one of the collection directories
 *
 * @constructor
 * @param {string} url    The URL of the file
 * @param {string} type   The type of file (i.e. posts, pages)
 * @param {object} layout The layout templates of the file
 */
class File {

  constructor(url, type, layout, config) {
    // Author-defined parameters

    this.author;
    this.content;
    this.date;
    this.datetime;
    this.draft = false;
    this.excerpt;
    this.image;
    this.layout = layout;
    this.seotitle;
    this.tags;
    this.title;

    // System-defined parameters

    this.config = config;
    this.body;
    // System parameter to track if the body has been rendered with markdown, (saves performance for large amounts of files)
    this.bodyLoaded = false;
    this.extension;
    this.html = false;
    this.name;
    this.permalink;
    this.type = type;
    this.url = url;
  }

  /**
  * Load file content from the server
  *
  * @method
  * @async
  * @param {function} callback - Callback function.
  */
  loadContent(callback) {
    get(this.url, (success, error, lastModified) => {
      if (error) callback(success, error);
      this.content = success;

      // Patch to retrieve the last modified timestamp automatically from the server.
      // If "datetime" is assigned in the content, it'll override the server header.
      if (lastModified) {
        this.datetime = lastModified;
      }

      // check if the response returns a string instead
      // of an response object
      if (typeof this.content === 'string') {
        callback(success, error);
      }
    });
  }

  /**
   * Parse front matter, the content in the header of the file.
   * 
   * Will scan through and retrieve any key:value pair within `---` tags
   * at the beginning of the file.
   * 
   * These values get set directly on the `File` object for use within templates or system use.
   */
  parseFrontMatter() {
    let yaml = this.content.split(this.config.frontMatterSeperator)[1],
      protectedAttributes = ['url', 'type', 'config', 'name', 'extension', 'body', 'permalink', 'bodyLoaded', 'html'];

    if (yaml) {
      let attributes = {};
      yaml.split(/\n/g).forEach((attributeStr) => {
        // Fix https://github.com/chrisdiana/cms.js/issues/95 by splitting ONLY on the first occurrence of a colon.
        if ( attributeStr.indexOf(':') !== -1) {
          let attPos = attributeStr.indexOf(':'),
            attKey = attributeStr.substr(0, attPos).trim(),
            attVal = attributeStr.substr(attPos +1).trim();
          
          if (protectedAttributes.indexOf(attKey) !== -1) {
            // To prevent the user from messing with important parameters, skip a few.
            // These are calculated and used internally and really shouldn't be modified.
            console.warn(this.url + ' has a protected key [' + attKey + '], value will NOT be parsed.');
            return;
          }
          
          if (this.config.listAttributes.indexOf(attKey) !== -1) {
            // Allow some parameters to have multiple values.
            attVal = attVal.split(',').map((item) => {
              return item.trim();
            });
          }
          
          if (this.config.urlAttributes.indexOf(attKey) !== -1) {
            // URLs should support a title / alt text
            // This allows for the use of meta fields in buttons or accessible images.
            let attTitle = '', attURL = '';
            if (attVal.indexOf('|') !== -1) {
              // Split on a '|'
              [attTitle, attURL] = attVal.split('|').map(s => { return s.trim(); });
            }
            else {
              attTitle = attVal.split('/').reverse()[0]; // basename
              attURL = attVal;
            }
            // Fix for relatively positioned images
            // An easy way to specify images in markdown files is to list them relative to the file itself.
            // Take the permalink (since it's already resolved), and prepend the base to the image.
            if (attURL.indexOf('://') === -1) {
              attURL = this.permalink.replace(/\/[^/]+$/, '/') + attURL;
            }

            attVal = {
              label: attTitle,
              url: attURL
            };
          }

          // Auto-typecast support for true/false
          if (attVal === 'true') {
            attVal = true;
          }

          if (attVal === 'false') {
            attVal = false;
          }

          if (attVal !== '') {
            // Only retrieve this key/value if the value is not an empty string.  (false is allowed)
            attributes[attKey] = attVal;
          }
        }
      });
      extend(this, attributes, null);
    }
  }

  /**
   * Parse filename from the URL of this file and sets to `name`
   */
  parseFilename() {
    this.name = this.url.substr(this.url.lastIndexOf('/'))
      .replace('/', '')
      .replace(this.config.extension, '');
  }

  /**
   * Parse permalink from the URL of this file and sets to `permalink`
   */
  parsePermalink() {
    this.permalink = 
      this.config.mode === 'GITHUB' ? 
        ['#', this.type, this.name].join('/') : 
        this.url.substring(0, this.url.length - this.config.extension.length) + '.html';
  }

  /**
   * Parse file date from either the frontmatter or server last-modified header
   */
  parseDate() {
    var dateRegEx = new RegExp(this.config.dateParser);
    if (this.date) {
      // Date is set from markdown via the "date" inline header
      this.datetime = getDatetime(this.date);
      this.date = this.config.dateFormat(this.datetime);
    } else if (dateRegEx.test(this.url)) {
      // Date is retrieved from file URL
      // Support 2023-01-02 and 2023/01/02 formats in the URL
      this.date = dateRegEx.exec(this.url)[0].replace('/', '-');
      this.datetime = getDatetime(this.date);
      this.date = this.config.dateFormat(this.datetime);
    } else if (this.datetime) {
      // Lastmodified is retrieved from server response headers or set from the front content
      this.datetime = getDatetime(this.datetime);
      this.date = this.config.dateFormat(this.datetime);
    } 
  }

  /**
   * Parse file body from the markdown content
   */
  parseBody() {
    if (!this.bodyLoaded) {
      // Only render content if it hasn't been loaded yet, (allows for repeated calls)

      let html = this.content
        .split(this.config.frontMatterSeperator)
        .splice(2)
        .join(this.config.frontMatterSeperator);
      if (this.html) {
        this.body = html;
      } else {
        if (this.config.markdownEngine) {
          this.body = this.config.markdownEngine(html);
        } else {
          let md = new Markdown();
          this.body = md.render(html);
        }
      }

      this.bodyLoaded = true;
    }
  }

  /**
   * Parse file content
   * 
   * Sets all file attributes and content.
   */
  parseContent() {
    this.parseFilename();
    this.parsePermalink();
    this.parseFrontMatter();
    this.parseDate();
  }

  /**
   * Perform a text search on this file to see if the content contains a given search query
   * 
   * @param {string} query Query to check if this file matches against
   * @returns {boolean}
   */
  matchesSearch(query) {
    let words = query.toLowerCase().split(' '),
      found = true;
    
    words.forEach(word => {
      if (
        this.content.toLowerCase().indexOf(word) === -1 &&
        this.title.toLowerCase().indexOf(word) === -1
      ) {
        // This keyword was not located anywhere, matches need to be complete when multiple words are provided.
        found = false;
        return false;
      }
    });

    return found;
  }

  /**
   * Perform an attribute search on this file to see if its metadata matches the query
   *
   * @param {Object} query Dictionary containing key/values to search
   * @param {string} [mode=AND] "OR" or "AND" if we should check all keys or any of them
   * @returns {boolean}
   *
   * @example
   * // Match if this file is authored by Alice
   * file.matchesAttributeSearch({author: 'Alice'});
   *
   * // Match if this file is authored by Alice or Bob
   * file.matchesAttributeSearch({author: ['Alice', 'Bob']});
   *
   * // Match if this file is authored by Alice or Bob AND has the tag Configuration
   * file.matchesAttributeSearch({author: ['Alice', 'Bob'], tags: 'Configuration'});
   *
   * // Match if this file is authored by Bob OR has the tag HR
   * file.matchesAttributeSearch({author: 'Bob', tags: 'HR'}, 'OR');
   */
  matchesAttributeSearch(query, mode) {
    let found = false, matches_all = true;

    mode = mode || 'AND';

    for (let [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        // Multiple values, this grouping is an 'OR' automatically
        let set_match = false;
        for(let i = 0; i < value.length; i++) {
          if (this._matchesAttribute(key, value[i])) {
            set_match = true;
          }
        }
        if (set_match) {
          found = true;
        }
        else {
          matches_all = false;
        }
      }
      else {
        if (this._matchesAttribute(key, value)) {
          found = true;
        }
        else {
          matches_all = false;
        }
      }
    }

    if (mode.toUpperCase() === 'OR') {
      // an OR check just needs at least one matching result
      return found;
    }
    else {
      // an AND check (default) needs at least one matching AND all other matching
      return found && matches_all;
    }
  }

  /**
   * Internal method to parse a value query, including support for comparison prefixes in the string
   * Supports a single value to compare and both single and array values from the metadata
   *
   * @param {string}      key   Frontmatter meta key to compare against
   * @param {string|null} value Value comparing
   * @returns {boolean}
   * @private
   */
  _matchesAttribute(key, value) {
    if (!Object.hasOwn(this, key) || this[key] === null) {
      // If the property is either not set or NULL, only NULL check value will match
      // This is done separately to make the Array logic easier herein.
      return value === null;
    }

    let local_val = this[key];
    if (!Array.isArray(local_val)) {
      // To support array values, just convert everything to an array to make the logic simpler.
      local_val = [ local_val ];
    }
    // local_val = this[key].toLowerCase();

    if (value !== null) {
      // Support different comparison options
      if (value.indexOf('~ ') === 0) {
        // "~ " prefix is RegExp
        value = value.substring(2);
        for(let val of local_val) {
          if ((new RegExp(value)).exec(val) !== null) {
            return true;
          }
        }
        return false;
      }
      else if(value.indexOf('>= ') === 0) {
        // Mathematical operation
        value = value.substring(3);
        for(let val of local_val) {
          if (val >= value) {
            return true;
          }
        }
        return false;
      }
      else if(value.indexOf('<= ') === 0) {
        // Mathematical operation
        value = value.substring(3);
        for(let val of local_val) {
          if (val <= value) {
            return true;
          }
        }
        return false;
      }
      else if(value.indexOf('> ') === 0) {
        // Mathematical operation
        value = value.substring(2);
        for(let val of local_val) {
          if (val > value) {
            return true;
          }
        }
        return false;
      }
      else if(value.indexOf('< ') === 0) {
        // Mathematical operation
        value = value.substring(2);
        for(let val of local_val) {
          if (val < value) {
            return true;
          }
        }
        return false;
      }
      else {
        // Default case, standard comparison
        value = value.toLowerCase();
        for(let val of local_val) {
          if (val.toLowerCase() === value) {
            return true;
          }
        }
        return false;
      }
    }
    else {
      return local_val === value;
    }
  }

  /**
   * Renders file with a configured layout
   * 
   * @async
   */
  render(callback) {
    this.parseBody();
    
    if (this.seotitle) {
      document.title = this.seotitle;
    } else if (this.title) {
      document.title = this.title;
    } else {
      document.title = 'Page';
    }
    return renderLayout(this.layout, this.config, this, callback);
  }

}

export default File;
