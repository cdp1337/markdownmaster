import { renderLayout } from './templater';
import { get, extend, getDatetime} from './utils';
import Markdown from './markdown';

/**
 * Represents a file.
 * @constructor
 * @param {string} url - The URL of the file.
 * @param {string} type - The type of file (i.e. posts, pages).
 * @param {object} layout - The layout templates of the file.
 */
class File {

  constructor(url, type, layout, config) {
    this.url = url;
    this.type = type;
    this.layout = layout;
    this.config = config;
    this.html = false;
    this.content;
    this.name;
    this.extension;
    this.title;
    this.seotitle;
    this.excerpt;
    this.date;
    this.datetime;
    this.author;
    this.body;
    this.permalink;
    this.tags;
    this.image;
  }

  /**
  * Get file content.
  * @method
  * @async
  * @param {function} callback - Callback function.
  * @description
  * Get the file's HTML content and set the file object html
  * attribute to the file content.
  */
  getContent(callback) {
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
   * Parse front matter.
   * @method
   * @description
   * Overrides post attributes if front matter is available.
   */
  parseFrontMatter() {
    var yaml = this.content.split(this.config.frontMatterSeperator)[1];
    if (yaml) {
      var attributes = {};
      yaml.split(/\n/g).forEach((attributeStr) => {
        // Fix https://github.com/chrisdiana/cms.js/issues/95 by splitting ONLY on the first occurrence of a colon.
        if ( attributeStr.indexOf(':') !== -1) {
          let attPos = attributeStr.indexOf(':'),
            attKey = attributeStr.substr(0, attPos).trim(),
            attVal = attributeStr.substr(attPos +1).trim();
          
          if (attKey === 'image') {
            // Fix for relatively positioned images
            // An easy way to specify images in markdown files is to list them relative to the file itself.
            // Take the permalink (since it's already resolved), and prepend the base to the image.
            if (attVal.indexOf('://') === -1) {
              attVal = this.permalink.replace(/\/[^/]+$/, '/') + attVal;
            }
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
   * Set list attributes.
   * @method
   * @description
   * Sets front matter attributes that are specified as list attributes to
   * an array by splitting the string by commas.
   */
  setListAttributes() {
    this.config.listAttributes.forEach((attribute) => {
      // Keep ESLint from complaining
      // ref https://ourcodeworld.com/articles/read/1425/how-to-fix-eslint-error-do-not-access-objectprototype-method-hasownproperty-from-target-object-no-prototype-builtins
      if (Object.getOwnPropertyDescriptor(this, attribute) && this[attribute]) {
        this[attribute] = this[attribute].split(',').map((item) => {
          return item.trim();
        });
      }
    });
  }

  /**
   * Sets filename.
   * @method
   */
  setFilename() {
    this.name = this.url.substr(this.url.lastIndexOf('/'))
      .replace('/', '')
      .replace(this.config.extension, '');
  }

  /**
   * Sets permalink.
   * @method
   */
  setPermalink() {
    this.permalink = 
      this.config.mode === 'GITHUB' ? 
        ['#', this.type, this.name].join('/') : 
        this.url.substring(0, this.url.length - this.config.extension.length) + '.html';
  }

  /**
   * Set file date.
   * @method
   * @description
   * Check if file has date in front matter otherwise use the date
   * in the filename.
   */
  setDate() {
    var dateRegEx = new RegExp(this.config.dateParser);
    if (this.date) {
      // Date is set from markdown via the "date" inline header
      this.datetime = getDatetime(this.date);
      this.date = this.config.dateFormat(this.datetime);
    } else if (dateRegEx.test(this.url)) {
      // Date is retrieved from file URL
      this.date = dateRegEx.exec(this.url)[0];
      this.datetime = getDatetime(this.date);
      this.date = this.config.dateFormat(this.datetime);
    } else if (this.datetime) {
      // Lastmodified is retrieved from server response headers or set from the front content
      this.datetime = getDatetime(this.datetime);
      this.date = this.config.dateFormat(this.datetime);
    } 
  }

  /**
   * Set file body.
   * @method
   * @description
   * Sets the body of the file based on content after the front matter.
   */
  setBody() {
    var html = this.content
      .split(this.config.frontMatterSeperator)
      .splice(2)
      .join(this.config.frontMatterSeperator);
    if (this.html) {
      this.body = html;
    } else {
      if (this.config.markdownEngine) {
        this.body = this.config.markdownEngine(html);
      } else {
        var md = new Markdown();
        this.body = md.render(html);
      }
    }
  }

  /**
   * Parse file content.
   * @method
   * @description
   * Sets all file attributes and content.
   */
  parseContent() {
    this.setFilename();
    this.setPermalink();
    this.parseFrontMatter();
    this.setListAttributes();
    this.setDate();
    this.setBody();
  }

  /**
   * Check if this file matches a given query
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
   * Renders file.
   * @method
   * @async
   */
  render(callback) {
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
