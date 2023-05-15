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

import { renderLayout } from './templater';
import {basename, dirname, getDatetime, pathJoin} from './utils';
import Markdown from './markdown';
import Log from './log';
import CMSError from './cmserror';
import jsYaml from 'js-yaml';

/**
 * Represents a Markdown file installed in one of the collection directories
 */
class File {

  /**
   * Set of keys which cannot be set from the FrontMatter content
   * These generally have a built-in or reserved purpose
   * @type {string[]}
   */
  static ProtectedAttributes = [
    'body',
    'bodyLoaded',
    'config',
    'content',
    'name',
    'permalink',
    'type',
    'url'
  ];

  /**
   * @param {string} url    The URL of the file
   * @param {string} type   The type of file (i.e. posts, pages)
   * @param {string} layout The layout templates of the file
   * @param {Config} config Configuration from the CMS
   */
  constructor(url, type, layout, config) {
    // Common author-defined parameters

    /**
     * Author name - pulled from FrontMatter
     * @type {string|null}
     */
    this.author = null;
    /**
     * Banner alt/label and URL for this page, useful for pretty headers on pages
     * @type {{label: string, url: string}|null}
     */
    this.banner = null;
    /**
     * Date published - pulled from FrontMatter or URL
     * Will be converted into the requested format from Config.dateParser
     *
     * @see {@link Config#dateParser} for rendering info
     * @type {string|null}
     */
    this.date = null;
    /**
     * Date object holding the date published - pulled from Last-Modified header
     * if date is not set otherwise
     * @type {Date|null}
     */
    this.datetime = null;
    /**
     * Set to TRUE to flag this File as draft (and not rendered to the site)
     * @type {boolean}
     */
    this.draft = false;
    /**
     * Short excerpt or teaser about the page, useful on listing pages
     * @type {string|null}
     */
    this.excerpt = null;
    /**
     * Image alt/label and URL for this page
     * @type {{label: string, url: string}|null}
     */
    this.image = null;
    /**
     * Default layout for rendering this file
     * @type {string}
     */
    this.layout = layout;
    /**
     * Window title / SEO title for this page, useful for differing from page title
     * @type {string|null}
     */
    this.seotitle = null;
    /**
     * List of tags associated with this page
     * @type {string[]|null}
     */
    this.tags = null;
    /**
     * Title for this page, generally rendered as an H1
     * @type {string|null}
     */
    this.title = null;


    // System-defined parameters

    /**
     * Rendered HTML body for this File
     * @type {string}
     */
    this.body = null;

    /**
     * Set to true when the HTML body has been parsed (performance tracker)
     * @type {boolean}
     */
    this.bodyLoaded = false;

    /**
     * System configuration
     * @type {Config}
     */
    this.config = config;

    /**
     * Raw Markdown contents of this File
     * @type {string}
     */
    this.content = null;

    /**
     * Base filename of this File (without the extension)
     * @type {string}
     */
    this.name = null;

    /**
     * Browseable link to this File (includes .html)
     * @type {string}
     */
    this.permalink = null;

    /**
     * Collection type this file resides under
     * @type {string}
     */
    this.type = type;

    /**
     * Path to the raw Markdown source file
     * @type {string}
     */
    this.url = url;
  }

  /**
   * Load file content from the server
   *
   * @returns {Promise<string>}
   * @throws {CMSError}
   */
  async loadContent() {
    return new Promise((resolve, reject) => {
      fetch(this.url)
        .then(response => {
          if (!response.ok) {
            Log.Warn(this.type, 'Unable to load file', this.url, response);

            reject(new CMSError(response.status, response.statusText));
          }

          if (response.headers.has('Last-Modified')) {
            this.datetime = response.headers.get('Last-Modified');
          }

          return response.text();
        })
        .then(content => {
          this.content = content;
          this.parseContent();

          Log.Debug(this.type, 'Loaded file ' + this.url);
          resolve(content);
        })
        .catch(e => {
          Log.Warn(this.type, 'Unable to load file', this, e);
          reject(new CMSError(503, e));
        });
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
    if (!this._checkHasFrontMatter()) {
      // No FrontMatter, nothing to scan.
      return;
    }

    let yaml = this.content.split(this.config.frontMatterSeperator)[1],
      data;

    if (yaml) {
      data = jsYaml.load(yaml);

      for(let [attKey, attVal] of Object.entries(data)) {
        // For convenience all tags should be lowercase.
        attKey = attKey.toLowerCase();

        if (File.ProtectedAttributes.indexOf(attKey) !== -1) {
          // To prevent the user from messing with important parameters, skip a few.
          // These are calculated and used internally and really shouldn't be modified.
          Log.Warn(this.type, this.url, 'has a protected key [' + attKey + '], value will NOT be parsed.');
          continue;
        }

        if (typeof this[attKey] === 'function') {
          // Do not allow methods to be overridden
          Log.Warn(this.type, this.url, 'unable to load key [' + attKey + '], target is a function!');
          continue;
        }

        this[attKey] = this._parseFrontMatterKey(attVal);
      }
    }
  }

  /**
   * Parse filename from the URL of this file and sets to `name`
   */
  parseFilename() {
    this.name = basename(this.url, true);
  }

  /**
   * Parse permalink from the URL of this file and sets to `permalink`
   */
  parsePermalink() {
    this.permalink = pathJoin(dirname(this.url), basename(this.url, true) + '.html');
  }

  /**
   * Parse file date from either the FrontMatter or server Last-Modified header
   */
  parseDate() {
    let dateRegEx = new RegExp(this.config.dateParser);
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

      let html;
      if (this._checkHasFrontMatter()) {
        // Trim off the FrontMatter from the content
        html = this.content
          .split(this.config.frontMatterSeperator)
          .splice(2)
          .join(this.config.frontMatterSeperator);
      } else {
        // This file does not contain any valid formatted FrontMatter content
        html = this.content;
      }

      if (this.config.markdownEngine) {
        this.body = this.config.markdownEngine(html);
      } else {
        this.body = (new Markdown()).render(html);
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
      found = true,
      checks = '';

    if (this.content) {
      checks += this.content.toLowerCase();
    }

    if (this.title) {
      checks += this.title.toLowerCase();
    }
    
    words.forEach(word => {
      if (checks.indexOf(word) === -1) {
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
   * Renders file with a configured layout
   *
   * @async
   * @returns {Promise}
   * @throws {Error}
   */
  async render() {
    this.parseBody();

    // Rendering a full page will update the page title
    if (this.seotitle) {
      document.title = this.seotitle;
    } else if (this.title) {
      document.title = this.title;
    } else {
      document.title = 'Page';
    }

    return renderLayout(this.layout, this);
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
    let op = '',
      check,
      local_val;

    if (!Object.hasOwn(this, key) || this[key] === null) {
      // If the property is either not set or NULL, only NULL check value will match
      // This is done separately to make the Array logic easier herein.
      return value === null;
    } else if (value === null) {
      // If the value is null, then we only want unset attributes,
      // but the above check confirmed that the value is set
      return false;
    }

    if (value.indexOf('~ ') === 0) {
      // "~ " prefix is RegExp
      op = '~';
      check = new RegExp(value.substring(2));
    }
    else if(value.indexOf('>= ') === 0) {
      // Mathematical operation
      op = '>=';
      check = value.substring(3);
    }
    else if(value.indexOf('<= ') === 0) {
      // Mathematical operation
      op = '<=';
      check = value.substring(3);
    }
    else if(value.indexOf('> ') === 0) {
      // Mathematical operation
      op = '>';
      check = value.substring(2);
    }
    else if(value.indexOf('< ') === 0) {
      // Mathematical operation
      op = '<';
      check = value.substring(2);
    }
    else {
      // Default case, standard comparison but done case insensitively
      op = '=';
      check = value.toLowerCase();
    }

    if (key === 'date') {
      // This is a useless parameter as it's formatted into a human-friendly version,
      // but we can remap it to datetime (that's probably what they wanted)
      key = 'datetime';
    }

    if (key === 'datetime') {
      // Dates must be compared against other Dates.
      check = new Date(value);
    }


    if (Array.isArray(this[key])) {
      local_val = this[key];
    } else {
      // To support array values, just convert everything to an array to make the logic simpler.
      local_val = [ this[key] ];
    }

    for(let val of local_val) {
      if (op === '~') {
        if (check.exec(val) !== null) {
          return true;
        }
      } else if (op === '>=') {
        if (val >= check) {
          return true;
        }
      } else if (op === '<=') {
        if (val <= check) {
          return true;
        }
      } else if (op === '>') {
        if (val > check) {
          return true;
        }
      } else if (op === '<') {
        if (val < check) {
          return true;
        }
      } else {
        if (val.toLowerCase() === check) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if this File has FrontMatter content
   *
   * This is important because parseContent needs to know if it needs to strip the meta fields
   * @returns {boolean}
   * @private
   */
  _checkHasFrontMatter() {
    if (this.content === null || this.content === '') {
      // Failsafe checks
      return false;
    }

    // FrontMatter always starts on line 1
    let r = new RegExp('^' + this.config.frontMatterSeperator),
      m = this.content.match(r);
    if (m === null) {
      return false;
    }

    // There must be at least 2 separators
    r = new RegExp('^' + this.config.frontMatterSeperator + '$[^]', 'gm');
    m = this.content.match(r);
    return (Array.isArray(m) && m.length >= 2);
  }

  /**
   * Parse a FrontMatter value for special functionality
   * @param {Object|Array|string|boolean|null|number} value
   * @returns {Object|Array|string|boolean|null|number}
   */
  _parseFrontMatterKey(value) {
    if(Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        value[i] = this._parseFrontMatterKey(value[i]);
      }
    } else if (value instanceof Date) {
      // Native Date objects will utilize UTC which is probably not what the user wanted.
      // Convert that date to the user's local timezone
      return new Date(value.getTime() + value.getTimezoneOffset() * 60000);
    } else if (value instanceof Object) {
      for(let [k, v] of Object.entries(value)) {
        if (k === 'src' || k === 'href') {
          // Objects may have HREF or SRC attributes, treat these as such
          // Fix for relatively positioned images
          // An easy way to specify images in markdown files is to list them relative to the file itself.
          // Take the permalink (since it's already resolved), and prepend the base to the image.
          if (v.indexOf('://') === -1) {
            if (!this.permalink) {
              // Ensure the permalink for this file is ready
              this.parsePermalink();
            }
            value[k] = pathJoin(dirname(this.permalink), v);
          }
        }

        if (k === 'src' && !Object.hasOwn(value, 'alt')) {
          // src is commonly used for images, so include an 'alt' attribute by default if not provided.
          value['alt'] = basename(value[k]);
        }
      }
    }

    return value;
  }
}

export default File;
