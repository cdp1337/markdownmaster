/*! @chrisdiana/cmsjs v2.0.1~cdp1337-20221105 | MIT (c) 2022 Chris Diana | https://github.com/chrisdiana/cms.js */
var CMS = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var defaults$1 = {
    elementId: null,
    layoutDirectory: null,
    defaultView: null,
    errorLayout: null,
    mode: 'SERVER',
    github: null,
    types: [],
    plugins: [],
    frontMatterSeperator: /^---$/m,
    listAttributes: ['tags'],
    dateParser: /\d{4}-\d{2}(?:-\d{2})?/,
    dateFormat: function dateFormat(date) {
      return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');
    },
    extension: '.md',
    sort: undefined,
    markdownEngine: null,
    debug: false,
    messageClassName: 'cms-messages',
    onload: function onload() {},
    onroute: function onroute() {},
    webpath: '/',
    titleSearchResults: 'Search Results'
  };

  var messageContainer;
  var messages = {
    NO_FILES_ERROR: 'ERROR: No files in directory',
    ELEMENT_ID_ERROR: 'ERROR: No element ID or ID incorrect. Check "elementId" parameter in config.',
    DIRECTORY_ERROR: 'ERROR: Error getting files. Make sure there is a directory for each type in config with files in it.',
    GET_FILE_ERROR: 'ERROR: Error getting the file',
    LAYOUT_LOAD_ERROR: 'ERROR: Error loading layout. Check the layout file to make sure it exists.',
    NOT_READY_WARNING: 'WARNING: Not ready to perform action'
  };

  /**
   * Creates message container element
   * @function
   * @param {string} classname - Container classname.
   */
  function createMessageContainer(classname) {
    messageContainer = document.createElement('div');
    messageContainer.className = classname;
    messageContainer.innerHTML = 'DEBUG';
    messageContainer.style.background = 'yellow';
    messageContainer.style.position = 'absolute';
    messageContainer.style.top = '0px';
    document.body.appendChild(messageContainer);
  }

  /**
   * Handle messages
   * @function
   * @param {string} message - Message.
   * @returns {string} message
   * @description
   * Used for debugging purposes.
   */
  function handleMessage(debug, message) {
    if (debug) messageContainer.innerHTML = message;
    return message;
  }

  /**
   * AJAX Get utility function.
   * @function
   * @async
   * @param {string} url - URL of the request.
   * @param {function} callback - Callback after request is complete.
   */
  function get(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          // Add support for returning the Last-Modified header for lazy timestamps
          callback(req.response, false, req.getResponseHeader('Last-Modified'));
        } else {
          callback(req, req.statusText, null);
        }
      }
    };
    req.send();
  }

  /**
   * Extend utility function for extending objects.
   * @function
   * @param {object} target - Target object to extend.
   * @param {object} opts - Options to extend.
   * @param {function} callback - Callback function after completion.
   * @returns {object} Extended target object.
   */
  function extend(target, opts, callback) {
    var next;
    if (typeof opts === 'undefined') {
      opts = target;
    }
    for (next in opts) {
      if (Object.prototype.hasOwnProperty.call(opts, next)) {
        target[next] = opts[next];
      }
    }
    if (callback) {
      callback();
    }
    return target;
  }

  /**
   * Utility function for getting a function name.
   * @function
   * @param {function} func - The function to get the name
   * @returns {string} Name of function.
   */
  function getFunctionName(func) {
    var ret = func.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  }

  /**
   * Checks if the file URL with file extension is a valid file to load.
   * @function
   * @param {string} fileUrl - File URL
   * @returns {boolean} Is valid.
   */
  function isValidFile(fileUrl, extension) {
    if (fileUrl) {
      var ext = fileUrl.split('.').pop();
      return ext === extension.replace('.', '') || ext === 'html' ? true : false;
    }
  }

  /**
   * Get URL parameter by name.
   * @function
   * @param {string} name - Name of parameter.
   * @param {string} url - URL
   * @returns {string} Parameter value
   */
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /**
   * Get Github URL based on configuration.
   * @function
   * @param {string} type - Type of file.
   * @returns {string} GIthub URL
   */
  function getGithubUrl(type, gh) {
    var url = [gh.host, 'repos', gh.username, gh.repo, 'contents', type + '?ref=' + gh.branch];
    if (gh.prefix) url.splice(5, 0, gh.prefix);
    return url.join('/');
  }

  /**
   * Formats date string to datetime
   * @param {string} dateString - Date string to convert.
   * @returns {object} Formatted datetime
   */
  function getDatetime(dateStr) {
    var dt = new Date(dateStr);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * -60000);
  }

  /**
   * @param {string} filepath - Full file path including file name.
   * @returns {string} filename
   */
  function getFilenameFromPath(filepath) {
    //return filepath.split('\\').pop().split('/').pop();
    return filepath.split('\\').pop();
  }

  /**
   * Templating function that renders HTML templates.
   * @function
   * @param {string} text - HTML text to be evaluated.
   * @returns {string} Rendered template with injected data.
   */
  function Templater(text) {
    return new Function('data', 'var output=' + JSON.stringify(text).replace(/<%=(.+?)%>/g, '"+($1)+"').replace(/<%(.+?)%>/g, '";$1\noutput+="') + ';return output;');
  }

  /**
   * Load template from URL.
   * @function
   * @async
   * @param {string} url - URL of template to load.
   * @param {object} data - Data to load into template.
   * @param {function} callback - Callback function
   */
  function loadTemplate(url, data, callback) {
    get(url, function (success, error) {
      if (error) callback(success, error);
      callback(Templater(success)(data), error);
    });
  }

  /**
   * Renders the layout into the main container.
   * @function renderLayout
   * @async
   * @param {string} layout - Filename of layout.
   * @param {object} data - Data passed to template.
   */
  function renderLayout(layout, config, data, callback) {
    //config.container.innerHTML = '';
    var url = [config.webpath, config.layoutDirectory, '/', layout, '.html'].join('');
    loadTemplate(url, data, function (success, error) {
      if (error) {
        handleMessage(messages['LAYOUT_LOAD_ERROR']);
        callback(null, error);
      } else {
        config.container.innerHTML = success;
        callback('rendered', null);
      }
    });
  }

  /**
   * Markdown renderer.
   * @thanks renehamburger/slimdown.js
   * @function
   * @returns {string} Rendered markdown content as HTML.
   */
  var Markdown = /*#__PURE__*/function () {
    function Markdown() {
      _classCallCheck(this, Markdown);
      this.rules = [
      // headers - fix link anchor tag regex
      {
        regex: /(#+)(.*)/g,
        replacement: function replacement(text, chars, content) {
          var level = chars.length;
          return '<h' + level + '>' + content.trim() + '</h' + level + '>';
        }
      },
      // image
      {
        regex: /!\[([^[]+)\]\(([^)]+)\)/g,
        replacement: '<img src=\'$2\' alt=\'$1\'>'
      },
      // hyperlink
      {
        regex: /\[([^[]+)\]\(([^)]+)\)/g,
        replacement: '<a href=\'$2\'>$1</a>'
      },
      // bold
      {
        regex: /(\*\*|__)(.*?)\1/g,
        replacement: '<strong>$2</strong>'
      },
      // emphasis
      {
        regex: /(\*|_)(.*?)\1/g,
        replacement: '<em>$2</em>'
      },
      // del
      {
        regex: /~~(.*?)~~/g,
        replacement: '<del>$1</del>'
      },
      // quote
      {
        regex: /:"(.*?)":/g,
        replacement: '<q>$1</q>'
      },
      // block code
      {
        regex: /```[a-z]*\n[\s\S]*?\n```/g,
        replacement: function replacement(text) {
          text = text.replace(/```/gm, '');
          return '<pre>' + text.trim() + '</pre>';
        }
      },
      // js code
      {
        regex: /&&&[a-z]*\n[\s\S]*?\n&&&/g,
        replacement: function replacement(text) {
          text = text.replace(/```/gm, '');
          return '<script type="text/javascript">' + text.trim() + '</script>';
        }
      },
      // inline code
      {
        regex: /`(.*?)`/g,
        replacement: '<code>$1</code>'
      },
      // ul lists
      {
        regex: /\n\*(.*)/g,
        replacement: function replacement(text, item) {
          return '\n<ul>\n\t<li>' + item.trim() + '</li>\n</ul>';
        }
      },
      // ol lists
      {
        regex: /\n[0-9]+\.(.*)/g,
        replacement: function replacement(text, item) {
          return '\n<ol>\n\t<li>' + item.trim() + '</li>\n</ol>';
        }
      },
      // blockquotes
      {
        regex: /\n(&gt;|>)(.*)/g,
        replacement: function replacement(text, tmp, item) {
          return '\n<blockquote>' + item.trim() + '</blockquote>';
        }
      },
      // horizontal rule
      {
        regex: /\n-{5,}/g,
        replacement: '\n<hr />'
      },
      // add paragraphs
      {
        regex: /\n([^\n]+)\n/g,
        replacement: function replacement(text, line) {
          var trimmed = line.trim();
          if (/^<\/?(ul|ol|li|h|p|bl)/i.test(trimmed)) {
            return '\n' + line + '\n';
          }
          return '\n<p>' + trimmed + '</p>\n';
        }
      },
      // fix extra ul
      {
        regex: /<\/ul>\s?<ul>/g,
        replacement: ''
      },
      // fix extra ol
      {
        regex: /<\/ol>\s?<ol>/g,
        replacement: ''
      },
      // fix extra blockquote
      {
        regex: /<\/blockquote><blockquote>/g,
        replacement: '\n'
      }];
    }
    _createClass(Markdown, [{
      key: "render",
      value: function render(text) {
        text = '\n' + text + '\n';
        this.rules.forEach(function (rule) {
          text = text.replace(rule.regex, rule.replacement);
        });
        return text.trim();
      }
    }]);
    return Markdown;
  }();

  /**
   * Represents a file.
   * @constructor
   * @param {string} url - The URL of the file.
   * @param {string} type - The type of file (i.e. posts, pages).
   * @param {object} layout - The layout templates of the file.
   */
  var File = /*#__PURE__*/function () {
    function File(url, type, layout, config) {
      _classCallCheck(this, File);
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
    _createClass(File, [{
      key: "getContent",
      value: function getContent(callback) {
        var _this = this;
        get(this.url, function (success, error, lastModified) {
          if (error) callback(success, error);
          _this.content = success;

          // Patch to retrieve the last modified timestamp automatically from the server.
          // If "datetime" is assigned in the content, it'll override the server header.
          if (lastModified) {
            _this.datetime = lastModified;
          }

          // check if the response returns a string instead
          // of an response object
          if (typeof _this.content === 'string') {
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
    }, {
      key: "parseFrontMatter",
      value: function parseFrontMatter() {
        var _this2 = this;
        var yaml = this.content.split(this.config.frontMatterSeperator)[1];
        if (yaml) {
          var attributes = {};
          yaml.split(/\n/g).forEach(function (attributeStr) {
            // Fix https://github.com/chrisdiana/cms.js/issues/95 by splitting ONLY on the first occurrence of a colon.
            if (attributeStr.indexOf(':') !== -1) {
              var attPos = attributeStr.indexOf(':'),
                attKey = attributeStr.substr(0, attPos).trim(),
                attVal = attributeStr.substr(attPos + 1).trim();
              if (attKey === 'image') {
                // Fix for relatively positioned images
                // An easy way to specify images in markdown files is to list them relative to the file itself.
                // Take the permalink (since it's already resolved), and prepend the base to the image.
                if (attVal.indexOf('://') === -1) {
                  attVal = _this2.permalink.replace(/\/[^/]+$/, '/') + attVal;
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
    }, {
      key: "setListAttributes",
      value: function setListAttributes() {
        var _this3 = this;
        this.config.listAttributes.forEach(function (attribute) {
          // Keep ESLint from complaining
          // ref https://ourcodeworld.com/articles/read/1425/how-to-fix-eslint-error-do-not-access-objectprototype-method-hasownproperty-from-target-object-no-prototype-builtins
          if (Object.getOwnPropertyDescriptor(_this3, attribute) && _this3[attribute]) {
            _this3[attribute] = _this3[attribute].split(',').map(function (item) {
              return item.trim();
            });
          }
        });
      }

      /**
       * Sets filename.
       * @method
       */
    }, {
      key: "setFilename",
      value: function setFilename() {
        this.name = this.url.substr(this.url.lastIndexOf('/')).replace('/', '').replace(this.config.extension, '');
      }

      /**
       * Sets permalink.
       * @method
       */
    }, {
      key: "setPermalink",
      value: function setPermalink() {
        this.permalink = this.config.mode === 'GITHUB' ? ['#', this.type, this.name].join('/') : this.url.substring(0, this.url.length - this.config.extension.length) + '.html';
      }

      /**
       * Set file date.
       * @method
       * @description
       * Check if file has date in front matter otherwise use the date
       * in the filename.
       */
    }, {
      key: "setDate",
      value: function setDate() {
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
    }, {
      key: "setBody",
      value: function setBody() {
        var html = this.content.split(this.config.frontMatterSeperator).splice(2).join(this.config.frontMatterSeperator);
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
    }, {
      key: "parseContent",
      value: function parseContent() {
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
    }, {
      key: "matchesSearch",
      value: function matchesSearch(query) {
        var _this4 = this;
        var words = query.toLowerCase().split(' '),
          found = true;
        words.forEach(function (word) {
          if (_this4.content.toLowerCase().indexOf(word) === -1 && _this4.title.toLowerCase().indexOf(word) === -1) {
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
    }, {
      key: "render",
      value: function render(callback) {
        if (this.seotitle) {
          document.title = this.seotitle;
        } else if (this.title) {
          document.title = this.title;
        } else {
          document.title = 'Page';
        }
        return renderLayout(this.layout, this.config, this, callback);
      }
    }]);
    return File;
  }();

  /**
   * Represents a file collection.
   * @constructor
   * @param {string} type - The type of file collection (i.e. posts, pages).
   * @param {object} layout - The layouts of the file collection type.
   */
  var FileCollection = /*#__PURE__*/function () {
    function FileCollection(type, layout, config) {
      _classCallCheck(this, FileCollection);
      this.type = type;
      this.layout = layout;
      this.config = config;
      this.files = [];
      this.directories = [];
      this[type] = this.files;
      this.directoriesScanned = 0;
    }

    /**
     * Generic function to assist with debug logging without needing if ... everywhere.
     * @param  {...any} args mixed arguments to pass
     */
    _createClass(FileCollection, [{
      key: "debuglog",
      value: function debuglog() {
        if (this.config.debug) {
          var _console;
          (_console = console).log.apply(_console, arguments);
        }
      }

      /**
       * Initialize file collection.
       * @method
       * @async
       * @param {function} callback - Callback function
       */
    }, {
      key: "init",
      value: function init(callback) {
        var _this = this;
        this.getFiles(function (success, error) {
          if (error) handleMessage(messages['DIRECTORY_ERROR']);
          _this.loadFiles(function (success, error) {
            if (error) handleMessage(messages['GET_FILE_ERROR']);
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
    }, {
      key: "getFileListUrl",
      value: function getFileListUrl(type, config) {
        return config.mode === 'GITHUB' ? getGithubUrl(type, config.github) : this.config.webpath + type;
      }

      /**
       * Get file URL.
       * @method
       * @param {object} file - File object.
       * @returns {string} File URL
       */
    }, {
      key: "getFileUrl",
      value: function getFileUrl(file, mode, type) {
        if (mode === 'GITHUB') {
          return file['download_url'];
        } else {
          var href = getFilenameFromPath(file.getAttribute('href'));
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
    }, {
      key: "getFileElements",
      value: function getFileElements(data) {
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
    }, {
      key: "getFiles",
      value: function getFiles(callback) {
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
    }, {
      key: "scanDirectory",
      value: function scanDirectory(callback, directory, recurse) {
        var _this2 = this;
        this.debuglog('Scanning directory', directory);
        get(directory, function (success, error) {
          if (error) callback(success, error);

          // find the file elements that are valid files, exclude others
          _this2.getFileElements(success).forEach(function (file) {
            var fileUrl = _this2.getFileUrl(file, _this2.config.mode, directory);
            _this2.debuglog('Found link ' + file + ' => ' + fileUrl);
            if (isValidFile(fileUrl, _this2.config.extension)) {
              // Regular markdown file
              _this2.debuglog('Adding ' + fileUrl + ' to collection ' + _this2.type);
              _this2.files.push(new File(fileUrl, _this2.type, _this2.layout.single, _this2.config));
            } else if (
            // Allow recurse to be disabled
            recurse &&
            // Only iterate when not in github mode
            _this2.config.mode !== 'GITHUB' &&
            // skip checking '?...' sort option links
            fileUrl[fileUrl.length - 1] === '/' &&
            // skip top-level path
            fileUrl !== _this2.config.webpath &&
            // skip parent directory links, we're going DOWN, not UP
            fileUrl.indexOf('/../') === -1) {
              // in SERVER mode, support recursing ONE directory deep.
              // Allow this for any directory listing NOT absolutely resolved (they will just point back to the parent directory)
              _this2.directories.push(fileUrl);
              _this2.scanDirectory(callback, fileUrl, false);
            }
          });
          _this2.directoriesScanned++;
          if (_this2.directoriesScanned === _this2.directories.length) {
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
    }, {
      key: "loadFiles",
      value: function loadFiles(callback) {
        var _this3 = this;
        var promises = [];
        // Load file content
        this.files.forEach(function (file, i) {
          file.getContent(function (success, error) {
            if (error) callback(success, error);
            promises.push(i);
            file.parseContent();
            // Execute after all content is loaded
            if (_this3.files.length == promises.length) {
              callback(success, error);
            }
          });
        });
      }

      /**
       * Search file collection by attribute.
       * @method
       * @param {string} search - Search query.
       * 
       * @todo Support multiple filters
       */
    }, {
      key: "search",
      value: function search(_search) {
        this[this.type] = this.files.filter(function (file) {
          return file.matchesSearch(_search);
        });
      }

      /**
       * Reset file collection files.
       * @method
       */
    }, {
      key: "resetSearch",
      value: function resetSearch() {
        this[this.type] = this.files;
      }

      /**
       * Filter content to display by a tag
       * @method
       * @param {string} query - Search query.
       * 
       * @todo Refactor to "filterByTag" (nothing is actually returned here)
       * @todo Support multiple filters
       */
    }, {
      key: "getByTag",
      value: function getByTag(query) {
        this[this.type] = this.files.filter(function (file) {
          if (query && file.tags) {
            return file.tags.some(function (tag) {
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
    }, {
      key: "filterByPermalink",
      value: function filterByPermalink(url) {
        var _this4 = this;
        this[this.type] = this.files.filter(function (file) {
          var fileUrl = file.permalink.substring(_this4.config.webpath.length);
          return fileUrl.match(url);
        });
      }

      /**
       * Get all tags located form this collection
       * 
       * Each set will contain the properties `name` and `count`
       * 
       * @returns {Object[]}
       */
    }, {
      key: "getTags",
      value: function getTags() {
        var tags = [],
          tagNames = [];
        this.files.forEach(function (file) {
          if (file.tags) {
            file.tags.forEach(function (tag) {
              var pos = tagNames.indexOf(tag);
              if (pos === -1) {
                // New tag discovered
                tags.push({
                  name: tag,
                  count: 1
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
       * @returns {object} File object.
       */
    }, {
      key: "getFileByPermalink",
      value: function getFileByPermalink(permalink) {
        var _this5 = this;
        this.debuglog('Retrieving file by permalink', permalink);
        var foundFiles = this.files.filter(function (file) {
          return file.permalink === permalink || file.permalink === _this5.config.webpath + permalink;
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
    }, {
      key: "render",
      value: function render(callback) {
        if (this.layout.title) {
          document.title = this.layout.title;
        } else {
          document.title = 'Listing';
        }
        return renderLayout(this.layout.list, this.config, this, callback);
      }
    }]);
    return FileCollection;
  }();

  /**
   * Represents a CMS instance
   * @constructor
   * @param {object} options - Configuration options.
   */
  var CMS = /*#__PURE__*/function () {
    function CMS(view, options) {
      _classCallCheck(this, CMS);
      this.ready = false;
      /** @property FileCollection[] */
      this.collections = {};
      this.filteredCollections = {};
      this.state;
      this.view = view;
      this.config = Object.assign({}, defaults$1, options);

      // Link to window for global functions
      view.CMS = this;
    }

    /**
     * Generic function to assist with debug logging without needing if ... everywhere.
     * @param  {...any} args mixed arguments to pass
     */
    _createClass(CMS, [{
      key: "debuglog",
      value: function debuglog() {
        if (this.config.debug) {
          var _console;
          (_console = console).log.apply(_console, arguments);
        }
      }

      /**
       * Init
       * @method
       * @description
       * Initializes the application based on the configuration. Sets up up config object,
       * hash change event listener for router, and loads the content.
       */
    }, {
      key: "init",
      value: function init() {
        var _this = this;
        // create message container element if debug mode is enabled
        if (this.config.debug) {
          createMessageContainer(this.config.messageClassName);
        }
        if (this.config.elementId) {
          // setup container
          this.config.container = document.getElementById(this.config.elementId);
          this.view.addEventListener('click', function (e) {
            if (e.target && e.target.nodeName === 'A') {
              _this.listenerLinkClick(e);
            }
          });
          if (this.config.container) {
            // setup file collections
            this.initFileCollections(function () {
              // check for hash changes
              _this.view.addEventListener('hashchange', _this.route.bind(_this), false);
              // AND check for location.history changes (for SEO reasons)
              _this.view.addEventListener('popstate', function () {
                _this.route();
              });
              // start router by manually triggering hash change
              //this.view.dispatchEvent(new HashChangeEvent('hashchange'));

              // Backwards compatibility with 2.0.1 events
              if (_this.config.onload && typeof _this.config.onload === 'function') {
                document.addEventListener('cms:load', function () {
                  _this.config.onload();
                });
              }
              if (_this.config.onroute && typeof _this.config.onroute === 'function') {
                document.addEventListener('cms:route', function () {
                  _this.config.onroute();
                });
              }
              _this.route();
              // register plugins and run onload events
              _this.ready = true;
              _this.registerPlugins();
              document.dispatchEvent(new CustomEvent('cms:load', {
                detail: {
                  cms: _this
                }
              }));
            });
          } else {
            handleMessage(this.config.debug, messages['ELEMENT_ID_ERROR']);
          }
        } else {
          handleMessage(this.config.debug, messages['ELEMENT_ID_ERROR']);
        }
      }

      /**
       * Handle processing links clicked, will re-route to the history for applicable links.
       * 
       * @param {Event} e Click event from user
       */
    }, {
      key: "listenerLinkClick",
      value: function listenerLinkClick(e) {
        var _this2 = this;
        var targetHref = e.target.href;

        // Scan if this link was a link to one of the articles,
        // we don't want to intercept non-page links.
        this.config.types.forEach(function (type) {
          if (targetHref.indexOf(window.location.origin + _this2.config.webpath + type.name + '/') === 0 && targetHref.substring(targetHref.length - 5) === '.html') {
            // Target link is a page within a registered type path
            _this2.historyPushState(targetHref);
            e.preventDefault();
            return false;
          }
          if (targetHref.indexOf(window.location.origin + _this2.config.webpath + type.name + '.html') === 0) {
            // Target link is a listing page for a registered type path
            _this2.historyPushState(targetHref);
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
    }, {
      key: "initFileCollections",
      value: function initFileCollections(callback) {
        var _this3 = this;
        var promises = [];
        var types = [];

        // setup collections and routes
        this.config.types.forEach(function (type) {
          _this3.collections[type.name] = new FileCollection(type.name, type.layout, _this3.config);
          types.push(type.name);
        });

        // init collections
        types.forEach(function (type, i) {
          _this3.collections[type].init(function () {
            _this3.debuglog('Initialized collection ' + type);
            promises.push(i);
            // reverse order to display newest posts first for post types
            if (type.indexOf('post') === 0) {
              _this3.collections[type][type].reverse();
            }
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
    }, {
      key: "getPathsFromURL",
      value: function getPathsFromURL() {
        var paths = window.location.pathname.substring(this.config.webpath.length).split('/');
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
    }, {
      key: "historyReplaceState",
      value: function historyReplaceState(url) {
        window.history.replaceState({}, '', url);
        // Immediately trigger route to switch to the new content.
        this.route();
      }
    }, {
      key: "historyPushState",
      value: function historyPushState(url) {
        window.history.pushState({}, '', url);
        // Immediately trigger route to switch to the new content.
        this.route();
      }
    }, {
      key: "route",
      value: function route() {
        var _this4 = this;
        this.debuglog('Initializing routing');
        var paths = this.getPathsFromURL(),
          type = paths[0],
          filename = paths.splice(1).join('/'),
          collection = this.collections[type],
          search = getParameterByName('s') || '',
          tag = getParameterByName('tag') || '',
          mode = '',
          file = null;
        this.debuglog('Paths retrieved from URL:', {
          type: type,
          filename: filename,
          collection: collection
        });
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
              file.render(function () {
                document.dispatchEvent(new CustomEvent('cms:route', {
                  detail: {
                    cms: _this4,
                    type: type,
                    file: file,
                    mode: mode,
                    search: search,
                    tag: tag,
                    collection: collection
                  }
                }));
              });
            } else if (collection) {
              // List view
              if (search) {
                // Check for queries
                collection.search(search);
              } else if (tag) {
                // Check for tags
                collection.getByTag(tag);
              } else {
                // Reset search
                collection.resetSearch();
              }
              mode = 'listing';
              collection.render(function () {
                document.dispatchEvent(new CustomEvent('cms:route', {
                  detail: {
                    cms: _this4,
                    type: type,
                    file: file,
                    mode: mode,
                    search: search,
                    tag: tag,
                    collection: collection
                  }
                }));
              });
            } else {
              throw 'Unknown request';
            }
          } catch (e) {
            mode = 'error';
            console.error(e);
            renderLayout(this.config.errorLayout, this.config, {}, function () {
              document.dispatchEvent(new CustomEvent('cms:route', {
                detail: {
                  cms: _this4,
                  type: type,
                  file: file,
                  mode: mode,
                  search: search,
                  tag: tag,
                  collection: collection
                }
              }));
            });
          }
        }
      }

      /**
       * Register plugins.
       * @method
       * @description
       * Set up plugins based on user configuration.
       */
    }, {
      key: "registerPlugins",
      value: function registerPlugins() {
        var _this5 = this;
        this.config.plugins.forEach(function (plugin) {
          var name = getFunctionName(plugin);
          if (!_this5[name]) {
            _this5[name] = plugin;
          }
        });
      }

      /**
        * Sort method for file collections.
        * @method
        * @param {string} type - Type of file collection.
        * @param {function} sort - Sorting function.
        */
    }, {
      key: "sort",
      value: function sort(type, _sort) {
        if (this.ready) {
          this.collections[type][type].sort(_sort);
          this.collections[type].render();
        } else {
          handleMessage(messages['NOT_READY_WARNING']);
        }
      }

      /**
        * Search method for file collections.
        * @method
        * @param {string} type - Type of file collection.
        * @param {string} attribute - File attribute to search.
        * @param {string} search - Search query.
        */
    }, {
      key: "search",
      value: function search(type, _search) {
        this.historyPushState(this.config.webpath + type + '.html?s=' + encodeURIComponent(_search));
      }
    }]);
    return CMS;
  }();

  /**
   * Automatically manages classes to the body based on the current page being viewed
   */
  var PageBodyClass = /*#__PURE__*/_createClass(function PageBodyClass() {
    var _this = this;
    _classCallCheck(this, PageBodyClass);
    // Used to track dynamic classes when browsing between pages
    this.classes = [];
    document.addEventListener('cms:route', function (e) {
      var newClasses = [],
        remClasses = [];
      if (e.detail.type && e.detail.mode) {
        newClasses.push(['page', e.detail.type, e.detail.mode].join('-'));
        if (e.detail.search) {
          newClasses.push(['page', e.detail.type, 'search'].join('-'));
        }
        if (e.detail.tag) {
          newClasses.push(['page', e.detail.type, 'tag'].join('-'));
        }
        if (e.detail.file) {
          // Translate the file URL to a valid class name
          // Omit the web path prefix
          var fileTag = e.detail.file.permalink.substring(e.detail.cms.config.webpath.length);
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
      _this.classes.forEach(function (c) {
        if (newClasses.indexOf(c) === -1) {
          remClasses.push(c);
        }
      });
      if (remClasses.length > 0) {
        var _document$body$classL;
        (_document$body$classL = document.body.classList).remove.apply(_document$body$classL, remClasses);
      }
      if (newClasses.length > 0) {
        var _document$body$classL2;
        (_document$body$classL2 = document.body.classList).add.apply(_document$body$classL2, newClasses);
      }

      // Remember the dynamic classes for the next pageload so they can be removed if necessary
      // otherwise browsing through different pages will simply keep adding more and more class tags.
      _this.classes = newClasses;
    });
  });

  var PageList = /*#__PURE__*/function () {
    function PageList() {
      var _this = this;
      _classCallCheck(this, PageList);
      document.addEventListener('cms:route', function (e) {
        document.querySelectorAll('[data-plugin="cms:pagelist"]').forEach(function (el) {
          if (el.dataset.loaded !== '1') {
            // Only process nodes which have not already been loaded.
            _this.execNode(e.detail.cms, el);
          }
        });
      });
    }

    /**
     * Display help text to the browser's console when something bad happened.
     */
    _createClass(PageList, [{
      key: "help",
      value: function help() {
        console.info('Using pagelist plugin: <div data-plugin="cms:pagelist" ...attributes></div>');
        console.table([{
          attribute: 'data-type',
          required: true,
          example: 'posts',
          description: 'Type of content to retrieve, must match config parameters'
        }, {
          attribute: 'data-layout',
          required: false,
          example: 'post-list',
          description: 'Layout filename to render content'
        }, {
          attribute: 'data-link',
          required: false,
          example: '^posts/subdirectory/.+',
          description: 'Regex or URL fragment to filter results'
        }]);
      }

      /**
       * Execute the plugin on a given node to render the requested content inside it
       * 
       * @param {CMS} CMS 
       * @param {Node} el 
       */
    }, {
      key: "execNode",
      value: function execNode(CMS, el) {
        // Failsafe to prevent this from running twice per node
        el.dataset.loaded = '1';
        var type = el.dataset.type,
          layout = el.dataset.layout || null,
          filterLink = el.dataset.link || null,
          collection,
          config;
        if (typeof type === 'undefined') {
          // "type" is a required attribute
          console.error('cms:pagelist plugin error: data-type is REQUIRED');
          this.help();
          return;
        }
        if (typeof CMS.collections[type] === 'undefined') {
          // "type" must match a valid collection type
          var validTypes = CMS.config.types.map(function (t) {
            return t.name;
          });
          console.error('cms:pagelist plugin error: data-type is not a valid registered content type', {
            type: type,
            validTypes: validTypes
          });
          this.help();
          return;
        }
        collection = CMS.collections[type];
        if (layout === null) {
          // Default for this collection
          layout = collection.layout.list;
        }

        // Support filters
        if (filterLink !== null) {
          collection.filterByPermalink(filterLink);
        }

        // Setup new config to override rendering of this content
        config = {
          container: el,
          webpath: collection.config.webpath,
          layoutDirectory: collection.config.layoutDirectory
        };

        // Use templater to render the requested content
        renderLayout(layout, config, collection, function () {});
      }
    }]);
    return PageList;
  }();

  /**
   * marked - a markdown parser
   * Copyright (c) 2011-2022, Christopher Jeffrey. (MIT Licensed)
   * https://github.com/markedjs/marked
   */

  /**
   * DO NOT EDIT THIS FILE
   * The code in this file is generated from files in ./src/
   */

  function getDefaults() {
    return {
      async: false,
      baseUrl: null,
      breaks: false,
      extensions: null,
      gfm: true,
      headerIds: true,
      headerPrefix: '',
      highlight: null,
      langPrefix: 'language-',
      mangle: true,
      pedantic: false,
      renderer: null,
      sanitize: false,
      sanitizer: null,
      silent: false,
      smartypants: false,
      tokenizer: null,
      walkTokens: null,
      xhtml: false
    };
  }

  let defaults = getDefaults();

  function changeDefaults(newDefaults) {
    defaults = newDefaults;
  }

  /**
   * Helpers
   */
  const escapeTest = /[&<>"']/;
  const escapeReplace = /[&<>"']/g;
  const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
  const escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  const getEscapeReplacement = (ch) => escapeReplacements[ch];
  function escape(html, encode) {
    if (encode) {
      if (escapeTest.test(html)) {
        return html.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }

    return html;
  }

  const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

  /**
   * @param {string} html
   */
  function unescape(html) {
    // explicitly match decimal, hex, and named HTML entities
    return html.replace(unescapeTest, (_, n) => {
      n = n.toLowerCase();
      if (n === 'colon') return ':';
      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x'
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return '';
    });
  }

  const caret = /(^|[^\[])\^/g;

  /**
   * @param {string | RegExp} regex
   * @param {string} opt
   */
  function edit(regex, opt) {
    regex = typeof regex === 'string' ? regex : regex.source;
    opt = opt || '';
    const obj = {
      replace: (name, val) => {
        val = val.source || val;
        val = val.replace(caret, '$1');
        regex = regex.replace(name, val);
        return obj;
      },
      getRegex: () => {
        return new RegExp(regex, opt);
      }
    };
    return obj;
  }

  const nonWordAndColonTest = /[^\w:]/g;
  const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

  /**
   * @param {boolean} sanitize
   * @param {string} base
   * @param {string} href
   */
  function cleanUrl(sanitize, base, href) {
    if (sanitize) {
      let prot;
      try {
        prot = decodeURIComponent(unescape(href))
          .replace(nonWordAndColonTest, '')
          .toLowerCase();
      } catch (e) {
        return null;
      }
      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
        return null;
      }
    }
    if (base && !originIndependentUrl.test(href)) {
      href = resolveUrl(base, href);
    }
    try {
      href = encodeURI(href).replace(/%25/g, '%');
    } catch (e) {
      return null;
    }
    return href;
  }

  const baseUrls = {};
  const justDomain = /^[^:]+:\/*[^/]*$/;
  const protocol = /^([^:]+:)[\s\S]*$/;
  const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

  /**
   * @param {string} base
   * @param {string} href
   */
  function resolveUrl(base, href) {
    if (!baseUrls[' ' + base]) {
      // we can ignore everything in base after the last slash of its path component,
      // but we might need to add _that_
      // https://tools.ietf.org/html/rfc3986#section-3
      if (justDomain.test(base)) {
        baseUrls[' ' + base] = base + '/';
      } else {
        baseUrls[' ' + base] = rtrim(base, '/', true);
      }
    }
    base = baseUrls[' ' + base];
    const relativeBase = base.indexOf(':') === -1;

    if (href.substring(0, 2) === '//') {
      if (relativeBase) {
        return href;
      }
      return base.replace(protocol, '$1') + href;
    } else if (href.charAt(0) === '/') {
      if (relativeBase) {
        return href;
      }
      return base.replace(domain, '$1') + href;
    } else {
      return base + href;
    }
  }

  const noopTest = { exec: function noopTest() {} };

  function merge(obj) {
    let i = 1,
      target,
      key;

    for (; i < arguments.length; i++) {
      target = arguments[i];
      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }

    return obj;
  }

  function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    const row = tableRow.replace(/\|/g, (match, offset, str) => {
        let escaped = false,
          curr = offset;
        while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
        if (escaped) {
          // odd number of slashes means | is escaped
          // so we leave it alone
          return '|';
        } else {
          // add space before unescaped |
          return ' |';
        }
      }),
      cells = row.split(/ \|/);
    let i = 0;

    // First/last cell in a row cannot be empty if it has no leading/trailing pipe
    if (!cells[0].trim()) { cells.shift(); }
    if (cells.length > 0 && !cells[cells.length - 1].trim()) { cells.pop(); }

    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) cells.push('');
    }

    for (; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }
    return cells;
  }

  /**
   * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
   * /c*$/ is vulnerable to REDOS.
   *
   * @param {string} str
   * @param {string} c
   * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
   */
  function rtrim(str, c, invert) {
    const l = str.length;
    if (l === 0) {
      return '';
    }

    // Length of suffix matching the invert condition.
    let suffLen = 0;

    // Step left until we fail to match the invert condition.
    while (suffLen < l) {
      const currChar = str.charAt(l - suffLen - 1);
      if (currChar === c && !invert) {
        suffLen++;
      } else if (currChar !== c && invert) {
        suffLen++;
      } else {
        break;
      }
    }

    return str.slice(0, l - suffLen);
  }

  function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }
    const l = str.length;
    let level = 0,
      i = 0;
    for (; i < l; i++) {
      if (str[i] === '\\') {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;
        if (level < 0) {
          return i;
        }
      }
    }
    return -1;
  }

  function checkSanitizeDeprecation(opt) {
    if (opt && opt.sanitize && !opt.silent) {
      console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
    }
  }

  // copied from https://stackoverflow.com/a/5450113/806777
  /**
   * @param {string} pattern
   * @param {number} count
   */
  function repeatString(pattern, count) {
    if (count < 1) {
      return '';
    }
    let result = '';
    while (count > 1) {
      if (count & 1) {
        result += pattern;
      }
      count >>= 1;
      pattern += pattern;
    }
    return result + pattern;
  }

  function outputLink(cap, link, raw, lexer) {
    const href = link.href;
    const title = link.title ? escape(link.title) : null;
    const text = cap[1].replace(/\\([\[\]])/g, '$1');

    if (cap[0].charAt(0) !== '!') {
      lexer.state.inLink = true;
      const token = {
        type: 'link',
        raw,
        href,
        title,
        text,
        tokens: lexer.inlineTokens(text)
      };
      lexer.state.inLink = false;
      return token;
    }
    return {
      type: 'image',
      raw,
      href,
      title,
      text: escape(text)
    };
  }

  function indentCodeCompensation(raw, text) {
    const matchIndentToCode = raw.match(/^(\s+)(?:```)/);

    if (matchIndentToCode === null) {
      return text;
    }

    const indentToCode = matchIndentToCode[1];

    return text
      .split('\n')
      .map(node => {
        const matchIndentInNode = node.match(/^\s+/);
        if (matchIndentInNode === null) {
          return node;
        }

        const [indentInNode] = matchIndentInNode;

        if (indentInNode.length >= indentToCode.length) {
          return node.slice(indentToCode.length);
        }

        return node;
      })
      .join('\n');
  }

  /**
   * Tokenizer
   */
  class Tokenizer {
    constructor(options) {
      this.options = options || defaults;
    }

    space(src) {
      const cap = this.rules.block.newline.exec(src);
      if (cap && cap[0].length > 0) {
        return {
          type: 'space',
          raw: cap[0]
        };
      }
    }

    code(src) {
      const cap = this.rules.block.code.exec(src);
      if (cap) {
        const text = cap[0].replace(/^ {1,4}/gm, '');
        return {
          type: 'code',
          raw: cap[0],
          codeBlockStyle: 'indented',
          text: !this.options.pedantic
            ? rtrim(text, '\n')
            : text
        };
      }
    }

    fences(src) {
      const cap = this.rules.block.fences.exec(src);
      if (cap) {
        const raw = cap[0];
        const text = indentCodeCompensation(raw, cap[3] || '');

        return {
          type: 'code',
          raw,
          lang: cap[2] ? cap[2].trim().replace(this.rules.inline._escapes, '$1') : cap[2],
          text
        };
      }
    }

    heading(src) {
      const cap = this.rules.block.heading.exec(src);
      if (cap) {
        let text = cap[2].trim();

        // remove trailing #s
        if (/#$/.test(text)) {
          const trimmed = rtrim(text, '#');
          if (this.options.pedantic) {
            text = trimmed.trim();
          } else if (!trimmed || / $/.test(trimmed)) {
            // CommonMark requires space before trailing #s
            text = trimmed.trim();
          }
        }

        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[1].length,
          text,
          tokens: this.lexer.inline(text)
        };
      }
    }

    hr(src) {
      const cap = this.rules.block.hr.exec(src);
      if (cap) {
        return {
          type: 'hr',
          raw: cap[0]
        };
      }
    }

    blockquote(src) {
      const cap = this.rules.block.blockquote.exec(src);
      if (cap) {
        const text = cap[0].replace(/^ *>[ \t]?/gm, '');

        return {
          type: 'blockquote',
          raw: cap[0],
          tokens: this.lexer.blockTokens(text, []),
          text
        };
      }
    }

    list(src) {
      let cap = this.rules.block.list.exec(src);
      if (cap) {
        let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
          line, nextLine, rawLine, itemContents, endEarly;

        let bull = cap[1].trim();
        const isordered = bull.length > 1;

        const list = {
          type: 'list',
          raw: '',
          ordered: isordered,
          start: isordered ? +bull.slice(0, -1) : '',
          loose: false,
          items: []
        };

        bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;

        if (this.options.pedantic) {
          bull = isordered ? bull : '[*+-]';
        }

        // Get next list item
        const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);

        // Check if current bullet point can start a new List Item
        while (src) {
          endEarly = false;
          if (!(cap = itemRegex.exec(src))) {
            break;
          }

          if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
            break;
          }

          raw = cap[0];
          src = src.substring(raw.length);

          line = cap[2].split('\n', 1)[0];
          nextLine = src.split('\n', 1)[0];

          if (this.options.pedantic) {
            indent = 2;
            itemContents = line.trimLeft();
          } else {
            indent = cap[2].search(/[^ ]/); // Find first non-space char
            indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
            itemContents = line.slice(indent);
            indent += cap[1].length;
          }

          blankLine = false;

          if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
            raw += nextLine + '\n';
            src = src.substring(nextLine.length + 1);
            endEarly = true;
          }

          if (!endEarly) {
            const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))`);
            const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
            const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
            const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);

            // Check if following lines should be included in List Item
            while (src) {
              rawLine = src.split('\n', 1)[0];
              line = rawLine;

              // Re-align to follow commonmark nesting rules
              if (this.options.pedantic) {
                line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
              }

              // End list item if found code fences
              if (fencesBeginRegex.test(line)) {
                break;
              }

              // End list item if found start of new heading
              if (headingBeginRegex.test(line)) {
                break;
              }

              // End list item if found start of new bullet
              if (nextBulletRegex.test(line)) {
                break;
              }

              // Horizontal rule found
              if (hrRegex.test(src)) {
                break;
              }

              if (line.search(/[^ ]/) >= indent || !line.trim()) { // Dedent if possible
                itemContents += '\n' + line.slice(indent);
              } else if (!blankLine) { // Until blank line, item doesn't need indentation
                itemContents += '\n' + line;
              } else { // Otherwise, improper indentation ends this item
                break;
              }

              if (!blankLine && !line.trim()) { // Check if current line is blank
                blankLine = true;
              }

              raw += rawLine + '\n';
              src = src.substring(rawLine.length + 1);
            }
          }

          if (!list.loose) {
            // If the previous item ended with a blank line, the list is loose
            if (endsWithBlankLine) {
              list.loose = true;
            } else if (/\n *\n *$/.test(raw)) {
              endsWithBlankLine = true;
            }
          }

          // Check for task list items
          if (this.options.gfm) {
            istask = /^\[[ xX]\] /.exec(itemContents);
            if (istask) {
              ischecked = istask[0] !== '[ ] ';
              itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
            }
          }

          list.items.push({
            type: 'list_item',
            raw,
            task: !!istask,
            checked: ischecked,
            loose: false,
            text: itemContents
          });

          list.raw += raw;
        }

        // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
        list.items[list.items.length - 1].raw = raw.trimRight();
        list.items[list.items.length - 1].text = itemContents.trimRight();
        list.raw = list.raw.trimRight();

        const l = list.items.length;

        // Item child tokens handled here at end because we needed to have the final item to trim it first
        for (i = 0; i < l; i++) {
          this.lexer.state.top = false;
          list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
          const spacers = list.items[i].tokens.filter(t => t.type === 'space');
          const hasMultipleLineBreaks = spacers.every(t => {
            const chars = t.raw.split('');
            let lineBreaks = 0;
            for (const char of chars) {
              if (char === '\n') {
                lineBreaks += 1;
              }
              if (lineBreaks > 1) {
                return true;
              }
            }

            return false;
          });

          if (!list.loose && spacers.length && hasMultipleLineBreaks) {
            // Having a single line break doesn't mean a list is loose. A single line break is terminating the last list item
            list.loose = true;
            list.items[i].loose = true;
          }
        }

        return list;
      }
    }

    html(src) {
      const cap = this.rules.block.html.exec(src);
      if (cap) {
        const token = {
          type: 'html',
          raw: cap[0],
          pre: !this.options.sanitizer
            && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: cap[0]
        };
        if (this.options.sanitize) {
          const text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
          token.type = 'paragraph';
          token.text = text;
          token.tokens = this.lexer.inline(text);
        }
        return token;
      }
    }

    def(src) {
      const cap = this.rules.block.def.exec(src);
      if (cap) {
        if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
        const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
        return {
          type: 'def',
          tag,
          raw: cap[0],
          href: cap[2] ? cap[2].replace(this.rules.inline._escapes, '$1') : cap[2],
          title: cap[3] ? cap[3].replace(this.rules.inline._escapes, '$1') : cap[3]
        };
      }
    }

    table(src) {
      const cap = this.rules.block.table.exec(src);
      if (cap) {
        const item = {
          type: 'table',
          header: splitCells(cap[1]).map(c => { return { text: c }; }),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : []
        };

        if (item.header.length === item.align.length) {
          item.raw = cap[0];

          let l = item.align.length;
          let i, j, k, row;
          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          l = item.rows.length;
          for (i = 0; i < l; i++) {
            item.rows[i] = splitCells(item.rows[i], item.header.length).map(c => { return { text: c }; });
          }

          // parse child tokens inside headers and cells

          // header child tokens
          l = item.header.length;
          for (j = 0; j < l; j++) {
            item.header[j].tokens = this.lexer.inline(item.header[j].text);
          }

          // cell child tokens
          l = item.rows.length;
          for (j = 0; j < l; j++) {
            row = item.rows[j];
            for (k = 0; k < row.length; k++) {
              row[k].tokens = this.lexer.inline(row[k].text);
            }
          }

          return item;
        }
      }
    }

    lheading(src) {
      const cap = this.rules.block.lheading.exec(src);
      if (cap) {
        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[2].charAt(0) === '=' ? 1 : 2,
          text: cap[1],
          tokens: this.lexer.inline(cap[1])
        };
      }
    }

    paragraph(src) {
      const cap = this.rules.block.paragraph.exec(src);
      if (cap) {
        const text = cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1];
        return {
          type: 'paragraph',
          raw: cap[0],
          text,
          tokens: this.lexer.inline(text)
        };
      }
    }

    text(src) {
      const cap = this.rules.block.text.exec(src);
      if (cap) {
        return {
          type: 'text',
          raw: cap[0],
          text: cap[0],
          tokens: this.lexer.inline(cap[0])
        };
      }
    }

    escape(src) {
      const cap = this.rules.inline.escape.exec(src);
      if (cap) {
        return {
          type: 'escape',
          raw: cap[0],
          text: escape(cap[1])
        };
      }
    }

    tag(src) {
      const cap = this.rules.inline.tag.exec(src);
      if (cap) {
        if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
          this.lexer.state.inLink = true;
        } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
          this.lexer.state.inLink = false;
        }
        if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = true;
        } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = false;
        }

        return {
          type: this.options.sanitize
            ? 'text'
            : 'html',
          raw: cap[0],
          inLink: this.lexer.state.inLink,
          inRawBlock: this.lexer.state.inRawBlock,
          text: this.options.sanitize
            ? (this.options.sanitizer
              ? this.options.sanitizer(cap[0])
              : escape(cap[0]))
            : cap[0]
        };
      }
    }

    link(src) {
      const cap = this.rules.inline.link.exec(src);
      if (cap) {
        const trimmedUrl = cap[2].trim();
        if (!this.options.pedantic && /^</.test(trimmedUrl)) {
          // commonmark requires matching angle brackets
          if (!(/>$/.test(trimmedUrl))) {
            return;
          }

          // ending angle bracket cannot be escaped
          const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
          if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
            return;
          }
        } else {
          // find closing parenthesis
          const lastParenIndex = findClosingBracket(cap[2], '()');
          if (lastParenIndex > -1) {
            const start = cap[0].indexOf('!') === 0 ? 5 : 4;
            const linkLen = start + cap[1].length + lastParenIndex;
            cap[2] = cap[2].substring(0, lastParenIndex);
            cap[0] = cap[0].substring(0, linkLen).trim();
            cap[3] = '';
          }
        }
        let href = cap[2];
        let title = '';
        if (this.options.pedantic) {
          // split pedantic href and title
          const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

          if (link) {
            href = link[1];
            title = link[3];
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : '';
        }

        href = href.trim();
        if (/^</.test(href)) {
          if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
            // pedantic allows starting angle bracket without ending angle bracket
            href = href.slice(1);
          } else {
            href = href.slice(1, -1);
          }
        }
        return outputLink(cap, {
          href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
          title: title ? title.replace(this.rules.inline._escapes, '$1') : title
        }, cap[0], this.lexer);
      }
    }

    reflink(src, links) {
      let cap;
      if ((cap = this.rules.inline.reflink.exec(src))
          || (cap = this.rules.inline.nolink.exec(src))) {
        let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
        link = links[link.toLowerCase()];
        if (!link || !link.href) {
          const text = cap[0].charAt(0);
          return {
            type: 'text',
            raw: text,
            text
          };
        }
        return outputLink(cap, link, cap[0], this.lexer);
      }
    }

    emStrong(src, maskedSrc, prevChar = '') {
      let match = this.rules.inline.emStrong.lDelim.exec(src);
      if (!match) return;

      // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
      if (match[3] && prevChar.match(/[\p{L}\p{N}]/u)) return;

      const nextChar = match[1] || match[2] || '';

      if (!nextChar || (nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
        const lLength = match[0].length - 1;
        let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;

        const endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
        endReg.lastIndex = 0;

        // Clip maskedSrc to same section of string as src (move to lexer?)
        maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

        while ((match = endReg.exec(maskedSrc)) != null) {
          rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];

          if (!rDelim) continue; // skip single * in __abc*abc__

          rLength = rDelim.length;

          if (match[3] || match[4]) { // found another Left Delim
            delimTotal += rLength;
            continue;
          } else if (match[5] || match[6]) { // either Left or Right Delim
            if (lLength % 3 && !((lLength + rLength) % 3)) {
              midDelimTotal += rLength;
              continue; // CommonMark Emphasis Rules 9-10
            }
          }

          delimTotal -= rLength;

          if (delimTotal > 0) continue; // Haven't found enough closing delimiters

          // Remove extra characters. *a*** -> *a*
          rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);

          const raw = src.slice(0, lLength + match.index + (match[0].length - rDelim.length) + rLength);

          // Create `em` if smallest delimiter has odd char count. *a***
          if (Math.min(lLength, rLength) % 2) {
            const text = raw.slice(1, -1);
            return {
              type: 'em',
              raw,
              text,
              tokens: this.lexer.inlineTokens(text)
            };
          }

          // Create 'strong' if smallest delimiter has even char count. **a***
          const text = raw.slice(2, -2);
          return {
            type: 'strong',
            raw,
            text,
            tokens: this.lexer.inlineTokens(text)
          };
        }
      }
    }

    codespan(src) {
      const cap = this.rules.inline.code.exec(src);
      if (cap) {
        let text = cap[2].replace(/\n/g, ' ');
        const hasNonSpaceChars = /[^ ]/.test(text);
        const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
          text = text.substring(1, text.length - 1);
        }
        text = escape(text, true);
        return {
          type: 'codespan',
          raw: cap[0],
          text
        };
      }
    }

    br(src) {
      const cap = this.rules.inline.br.exec(src);
      if (cap) {
        return {
          type: 'br',
          raw: cap[0]
        };
      }
    }

    del(src) {
      const cap = this.rules.inline.del.exec(src);
      if (cap) {
        return {
          type: 'del',
          raw: cap[0],
          text: cap[2],
          tokens: this.lexer.inlineTokens(cap[2])
        };
      }
    }

    autolink(src, mangle) {
      const cap = this.rules.inline.autolink.exec(src);
      if (cap) {
        let text, href;
        if (cap[2] === '@') {
          text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
          href = 'mailto:' + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }

        return {
          type: 'link',
          raw: cap[0],
          text,
          href,
          tokens: [
            {
              type: 'text',
              raw: text,
              text
            }
          ]
        };
      }
    }

    url(src, mangle) {
      let cap;
      if (cap = this.rules.inline.url.exec(src)) {
        let text, href;
        if (cap[2] === '@') {
          text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
          href = 'mailto:' + text;
        } else {
          // do extended autolink path validation
          let prevCapZero;
          do {
            prevCapZero = cap[0];
            cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);
          text = escape(cap[0]);
          if (cap[1] === 'www.') {
            href = 'http://' + text;
          } else {
            href = text;
          }
        }
        return {
          type: 'link',
          raw: cap[0],
          text,
          href,
          tokens: [
            {
              type: 'text',
              raw: text,
              text
            }
          ]
        };
      }
    }

    inlineText(src, smartypants) {
      const cap = this.rules.inline.text.exec(src);
      if (cap) {
        let text;
        if (this.lexer.state.inRawBlock) {
          text = this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0];
        } else {
          text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
        }
        return {
          type: 'text',
          raw: cap[0],
          text
        };
      }
    }
  }

  /**
   * Block-Level Grammar
   */
  const block = {
    newline: /^(?: *(?:\n|$))+/,
    code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
    fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
    hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
    heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
    blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
    list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
    html: '^ {0,3}(?:' // optional indentation
      + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
      + '|comment[^\\n]*(\\n+|$)' // (2)
      + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
      + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
      + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
      + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
      + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
      + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
      + ')',
    def: /^ {0,3}\[(label)\]: *(?:\n *)?<?([^\s>]+)>?(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
    table: noopTest,
    lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
    // regex template, placeholders will be replaced according to different paragraph
    // interruption rules of commonmark and the original markdown spec:
    _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
    text: /^[^\n]+/
  };

  block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
  block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
  block.def = edit(block.def)
    .replace('label', block._label)
    .replace('title', block._title)
    .getRegex();

  block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
  block.listItemStart = edit(/^( *)(bull) */)
    .replace('bull', block.bullet)
    .getRegex();

  block.list = edit(block.list)
    .replace(/bull/g, block.bullet)
    .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
    .replace('def', '\\n+(?=' + block.def.source + ')')
    .getRegex();

  block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
    + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
    + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
    + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
    + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
    + '|track|ul';
  block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
  block.html = edit(block.html, 'i')
    .replace('comment', block._comment)
    .replace('tag', block._tag)
    .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
    .getRegex();

  block.paragraph = edit(block._paragraph)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
    .replace('|table', '')
    .replace('blockquote', ' {0,3}>')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
    .getRegex();

  block.blockquote = edit(block.blockquote)
    .replace('paragraph', block.paragraph)
    .getRegex();

  /**
   * Normal Block Grammar
   */

  block.normal = merge({}, block);

  /**
   * GFM Block Grammar
   */

  block.gfm = merge({}, block.normal, {
    table: '^ *([^\\n ].*\\|.*)\\n' // Header
      + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
      + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
  });

  block.gfm.table = edit(block.gfm.table)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('blockquote', ' {0,3}>')
    .replace('code', ' {4}[^\\n]')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
    .getRegex();

  block.gfm.paragraph = edit(block._paragraph)
    .replace('hr', block.hr)
    .replace('heading', ' {0,3}#{1,6} ')
    .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
    .replace('table', block.gfm.table) // interrupt paragraphs with table
    .replace('blockquote', ' {0,3}>')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
    .getRegex();
  /**
   * Pedantic grammar (original John Gruber's loose markdown specification)
   */

  block.pedantic = merge({}, block.normal, {
    html: edit(
      '^ *(?:comment *(?:\\n|\\s*$)'
      + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
      + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
      .replace('comment', block._comment)
      .replace(/tag/g, '(?!(?:'
        + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
        + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
        + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
      .getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noopTest, // fences not supported
    paragraph: edit(block.normal._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' *#{1,6} *[^\n]')
      .replace('lheading', block.lheading)
      .replace('blockquote', ' {0,3}>')
      .replace('|fences', '')
      .replace('|list', '')
      .replace('|html', '')
      .getRegex()
  });

  /**
   * Inline-Level Grammar
   */
  const inline = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
    url: noopTest,
    tag: '^comment'
      + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
      + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
      + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
      + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
      + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
    link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
    reflink: /^!?\[(label)\]\[(ref)\]/,
    nolink: /^!?\[(ref)\](?:\[\])?/,
    reflinkSearch: 'reflink|nolink(?!\\()',
    emStrong: {
      lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
      //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
      //          () Skip orphan inside strong                                      () Consume to delim     (1) #***                (2) a***#, a***                             (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
      rDelimAst: /^(?:[^_*\\]|\\.)*?\_\_(?:[^_*\\]|\\.)*?\*(?:[^_*\\]|\\.)*?(?=\_\_)|(?:[^*\\]|\\.)+(?=[^*])|[punct_](\*+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|(?:[^punct*_\s\\]|\\.)(\*+)(?=[^punct*_\s])/,
      rDelimUnd: /^(?:[^_*\\]|\\.)*?\*\*(?:[^_*\\]|\\.)*?\_(?:[^_*\\]|\\.)*?(?=\*\*)|(?:[^_\\]|\\.)+(?=[^_])|[punct*](\_+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _
    },
    code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    br: /^( {2,}|\\)\n(?!\s*$)/,
    del: noopTest,
    text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
    punctuation: /^([\spunctuation])/
  };

  // list of punctuation marks from CommonMark spec
  // without * and _ to handle the different emphasis markers * and _
  inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
  inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();

  // sequences em should skip over [title](link), `code`, <html>
  inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
  // lookbehind is not available on Safari as of version 16
  // inline.escapedEmSt = /(?<=(?:^|[^\\)(?:\\[^])*)\\[*_]/g;
  inline.escapedEmSt = /(?:^|[^\\])(?:\\\\)*\\[*_]/g;

  inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();

  inline.emStrong.lDelim = edit(inline.emStrong.lDelim)
    .replace(/punct/g, inline._punctuation)
    .getRegex();

  inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g')
    .replace(/punct/g, inline._punctuation)
    .getRegex();

  inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g')
    .replace(/punct/g, inline._punctuation)
    .getRegex();

  inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

  inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
  inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
  inline.autolink = edit(inline.autolink)
    .replace('scheme', inline._scheme)
    .replace('email', inline._email)
    .getRegex();

  inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

  inline.tag = edit(inline.tag)
    .replace('comment', inline._comment)
    .replace('attribute', inline._attribute)
    .getRegex();

  inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
  inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

  inline.link = edit(inline.link)
    .replace('label', inline._label)
    .replace('href', inline._href)
    .replace('title', inline._title)
    .getRegex();

  inline.reflink = edit(inline.reflink)
    .replace('label', inline._label)
    .replace('ref', block._label)
    .getRegex();

  inline.nolink = edit(inline.nolink)
    .replace('ref', block._label)
    .getRegex();

  inline.reflinkSearch = edit(inline.reflinkSearch, 'g')
    .replace('reflink', inline.reflink)
    .replace('nolink', inline.nolink)
    .getRegex();

  /**
   * Normal Inline Grammar
   */

  inline.normal = merge({}, inline);

  /**
   * Pedantic Inline Grammar
   */

  inline.pedantic = merge({}, inline.normal, {
    strong: {
      start: /^__|\*\*/,
      middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      endAst: /\*\*(?!\*)/g,
      endUnd: /__(?!_)/g
    },
    em: {
      start: /^_|\*/,
      middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
      endAst: /\*(?!\*)/g,
      endUnd: /_(?!_)/g
    },
    link: edit(/^!?\[(label)\]\((.*?)\)/)
      .replace('label', inline._label)
      .getRegex(),
    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
      .replace('label', inline._label)
      .getRegex()
  });

  /**
   * GFM Inline Grammar
   */

  inline.gfm = merge({}, inline.normal, {
    escape: edit(inline.escape).replace('])', '~|])').getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
  });

  inline.gfm.url = edit(inline.gfm.url, 'i')
    .replace('email', inline.gfm._extended_email)
    .getRegex();
  /**
   * GFM + Line Breaks Inline Grammar
   */

  inline.breaks = merge({}, inline.gfm, {
    br: edit(inline.br).replace('{2,}', '*').getRegex(),
    text: edit(inline.gfm.text)
      .replace('\\b_', '\\b_| {2,}\\n')
      .replace(/\{2,\}/g, '*')
      .getRegex()
  });

  /**
   * smartypants text replacement
   * @param {string} text
   */
  function smartypants(text) {
    return text
      // em-dashes
      .replace(/---/g, '\u2014')
      // en-dashes
      .replace(/--/g, '\u2013')
      // opening singles
      .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
      // closing singles & apostrophes
      .replace(/'/g, '\u2019')
      // opening doubles
      .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
      // closing doubles
      .replace(/"/g, '\u201d')
      // ellipses
      .replace(/\.{3}/g, '\u2026');
  }

  /**
   * mangle email addresses
   * @param {string} text
   */
  function mangle(text) {
    let out = '',
      i,
      ch;

    const l = text.length;
    for (i = 0; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }
      out += '&#' + ch + ';';
    }

    return out;
  }

  /**
   * Block Lexer
   */
  class Lexer {
    constructor(options) {
      this.tokens = [];
      this.tokens.links = Object.create(null);
      this.options = options || defaults;
      this.options.tokenizer = this.options.tokenizer || new Tokenizer();
      this.tokenizer = this.options.tokenizer;
      this.tokenizer.options = this.options;
      this.tokenizer.lexer = this;
      this.inlineQueue = [];
      this.state = {
        inLink: false,
        inRawBlock: false,
        top: true
      };

      const rules = {
        block: block.normal,
        inline: inline.normal
      };

      if (this.options.pedantic) {
        rules.block = block.pedantic;
        rules.inline = inline.pedantic;
      } else if (this.options.gfm) {
        rules.block = block.gfm;
        if (this.options.breaks) {
          rules.inline = inline.breaks;
        } else {
          rules.inline = inline.gfm;
        }
      }
      this.tokenizer.rules = rules;
    }

    /**
     * Expose Rules
     */
    static get rules() {
      return {
        block,
        inline
      };
    }

    /**
     * Static Lex Method
     */
    static lex(src, options) {
      const lexer = new Lexer(options);
      return lexer.lex(src);
    }

    /**
     * Static Lex Inline Method
     */
    static lexInline(src, options) {
      const lexer = new Lexer(options);
      return lexer.inlineTokens(src);
    }

    /**
     * Preprocessing
     */
    lex(src) {
      src = src
        .replace(/\r\n|\r/g, '\n');

      this.blockTokens(src, this.tokens);

      let next;
      while (next = this.inlineQueue.shift()) {
        this.inlineTokens(next.src, next.tokens);
      }

      return this.tokens;
    }

    /**
     * Lexing
     */
    blockTokens(src, tokens = []) {
      if (this.options.pedantic) {
        src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
      } else {
        src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
          return leading + '    '.repeat(tabs.length);
        });
      }

      let token, lastToken, cutSrc, lastParagraphClipped;

      while (src) {
        if (this.options.extensions
          && this.options.extensions.block
          && this.options.extensions.block.some((extTokenizer) => {
            if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              return true;
            }
            return false;
          })) {
          continue;
        }

        // newline
        if (token = this.tokenizer.space(src)) {
          src = src.substring(token.raw.length);
          if (token.raw.length === 1 && tokens.length > 0) {
            // if there's a single \n as a spacer, it's terminating the last line,
            // so move it there so that we don't get unecessary paragraph tags
            tokens[tokens.length - 1].raw += '\n';
          } else {
            tokens.push(token);
          }
          continue;
        }

        // code
        if (token = this.tokenizer.code(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          // An indented code block cannot interrupt a paragraph.
          if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          continue;
        }

        // fences
        if (token = this.tokenizer.fences(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // heading
        if (token = this.tokenizer.heading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // hr
        if (token = this.tokenizer.hr(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // blockquote
        if (token = this.tokenizer.blockquote(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // list
        if (token = this.tokenizer.list(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // html
        if (token = this.tokenizer.html(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // def
        if (token = this.tokenizer.def(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.raw;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else if (!this.tokens.links[token.tag]) {
            this.tokens.links[token.tag] = {
              href: token.href,
              title: token.title
            };
          }
          continue;
        }

        // table (gfm)
        if (token = this.tokenizer.table(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // lheading
        if (token = this.tokenizer.lheading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // top-level paragraph
        // prevent paragraph consuming extensions by clipping 'src' to extension start
        cutSrc = src;
        if (this.options.extensions && this.options.extensions.startBlock) {
          let startIndex = Infinity;
          const tempSrc = src.slice(1);
          let tempStart;
          this.options.extensions.startBlock.forEach(function(getStartIndex) {
            tempStart = getStartIndex.call({ lexer: this }, tempSrc);
            if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
          });
          if (startIndex < Infinity && startIndex >= 0) {
            cutSrc = src.substring(0, startIndex + 1);
          }
        }
        if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
          lastToken = tokens[tokens.length - 1];
          if (lastParagraphClipped && lastToken.type === 'paragraph') {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          lastParagraphClipped = (cutSrc.length !== src.length);
          src = src.substring(token.raw.length);
          continue;
        }

        // text
        if (token = this.tokenizer.text(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && lastToken.type === 'text') {
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          continue;
        }

        if (src) {
          const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      this.state.top = true;
      return tokens;
    }

    inline(src, tokens = []) {
      this.inlineQueue.push({ src, tokens });
      return tokens;
    }

    /**
     * Lexing/Compiling
     */
    inlineTokens(src, tokens = []) {
      let token, lastToken, cutSrc;

      // String with links masked to avoid interference with em and strong
      let maskedSrc = src;
      let match;
      let keepPrevChar, prevChar;

      // Mask out reflinks
      if (this.tokens.links) {
        const links = Object.keys(this.tokens.links);
        if (links.length > 0) {
          while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
            if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
              maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
            }
          }
        }
      }
      // Mask out other blocks
      while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
      }

      // Mask out escaped em & strong delimiters
      while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index + match[0].length - 2) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
        this.tokenizer.rules.inline.escapedEmSt.lastIndex--;
      }

      while (src) {
        if (!keepPrevChar) {
          prevChar = '';
        }
        keepPrevChar = false;

        // extensions
        if (this.options.extensions
          && this.options.extensions.inline
          && this.options.extensions.inline.some((extTokenizer) => {
            if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              return true;
            }
            return false;
          })) {
          continue;
        }

        // escape
        if (token = this.tokenizer.escape(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // tag
        if (token = this.tokenizer.tag(src)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && token.type === 'text' && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }

        // link
        if (token = this.tokenizer.link(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // reflink, nolink
        if (token = this.tokenizer.reflink(src, this.tokens.links)) {
          src = src.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && token.type === 'text' && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }

        // em & strong
        if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // code
        if (token = this.tokenizer.codespan(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // br
        if (token = this.tokenizer.br(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // del (gfm)
        if (token = this.tokenizer.del(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // autolink
        if (token = this.tokenizer.autolink(src, mangle)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // url (gfm)
        if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        }

        // text
        // prevent inlineText consuming extensions by clipping 'src' to extension start
        cutSrc = src;
        if (this.options.extensions && this.options.extensions.startInline) {
          let startIndex = Infinity;
          const tempSrc = src.slice(1);
          let tempStart;
          this.options.extensions.startInline.forEach(function(getStartIndex) {
            tempStart = getStartIndex.call({ lexer: this }, tempSrc);
            if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
          });
          if (startIndex < Infinity && startIndex >= 0) {
            cutSrc = src.substring(0, startIndex + 1);
          }
        }
        if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
          src = src.substring(token.raw.length);
          if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
            prevChar = token.raw.slice(-1);
          }
          keepPrevChar = true;
          lastToken = tokens[tokens.length - 1];
          if (lastToken && lastToken.type === 'text') {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }

        if (src) {
          const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      return tokens;
    }
  }

  /**
   * Renderer
   */
  class Renderer {
    constructor(options) {
      this.options = options || defaults;
    }

    code(code, infostring, escaped) {
      const lang = (infostring || '').match(/\S*/)[0];
      if (this.options.highlight) {
        const out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      code = code.replace(/\n$/, '') + '\n';

      if (!lang) {
        return '<pre><code>'
          + (escaped ? code : escape(code, true))
          + '</code></pre>\n';
      }

      return '<pre><code class="'
        + this.options.langPrefix
        + escape(lang, true)
        + '">'
        + (escaped ? code : escape(code, true))
        + '</code></pre>\n';
    }

    /**
     * @param {string} quote
     */
    blockquote(quote) {
      return `<blockquote>\n${quote}</blockquote>\n`;
    }

    html(html) {
      return html;
    }

    /**
     * @param {string} text
     * @param {string} level
     * @param {string} raw
     * @param {any} slugger
     */
    heading(text, level, raw, slugger) {
      if (this.options.headerIds) {
        const id = this.options.headerPrefix + slugger.slug(raw);
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      }

      // ignore IDs
      return `<h${level}>${text}</h${level}>\n`;
    }

    hr() {
      return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    }

    list(body, ordered, start) {
      const type = ordered ? 'ol' : 'ul',
        startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
      return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    }

    /**
     * @param {string} text
     */
    listitem(text) {
      return `<li>${text}</li>\n`;
    }

    checkbox(checked) {
      return '<input '
        + (checked ? 'checked="" ' : '')
        + 'disabled="" type="checkbox"'
        + (this.options.xhtml ? ' /' : '')
        + '> ';
    }

    /**
     * @param {string} text
     */
    paragraph(text) {
      return `<p>${text}</p>\n`;
    }

    /**
     * @param {string} header
     * @param {string} body
     */
    table(header, body) {
      if (body) body = `<tbody>${body}</tbody>`;

      return '<table>\n'
        + '<thead>\n'
        + header
        + '</thead>\n'
        + body
        + '</table>\n';
    }

    /**
     * @param {string} content
     */
    tablerow(content) {
      return `<tr>\n${content}</tr>\n`;
    }

    tablecell(content, flags) {
      const type = flags.header ? 'th' : 'td';
      const tag = flags.align
        ? `<${type} align="${flags.align}">`
        : `<${type}>`;
      return tag + content + `</${type}>\n`;
    }

    /**
     * span level renderer
     * @param {string} text
     */
    strong(text) {
      return `<strong>${text}</strong>`;
    }

    /**
     * @param {string} text
     */
    em(text) {
      return `<em>${text}</em>`;
    }

    /**
     * @param {string} text
     */
    codespan(text) {
      return `<code>${text}</code>`;
    }

    br() {
      return this.options.xhtml ? '<br/>' : '<br>';
    }

    /**
     * @param {string} text
     */
    del(text) {
      return `<del>${text}</del>`;
    }

    /**
     * @param {string} href
     * @param {string} title
     * @param {string} text
     */
    link(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }
      let out = '<a href="' + escape(href) + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    }

    /**
     * @param {string} href
     * @param {string} title
     * @param {string} text
     */
    image(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }

      let out = `<img src="${href}" alt="${text}"`;
      if (title) {
        out += ` title="${title}"`;
      }
      out += this.options.xhtml ? '/>' : '>';
      return out;
    }

    text(text) {
      return text;
    }
  }

  /**
   * TextRenderer
   * returns only the textual part of the token
   */
  class TextRenderer {
    // no need for block level renderers
    strong(text) {
      return text;
    }

    em(text) {
      return text;
    }

    codespan(text) {
      return text;
    }

    del(text) {
      return text;
    }

    html(text) {
      return text;
    }

    text(text) {
      return text;
    }

    link(href, title, text) {
      return '' + text;
    }

    image(href, title, text) {
      return '' + text;
    }

    br() {
      return '';
    }
  }

  /**
   * Slugger generates header id
   */
  class Slugger {
    constructor() {
      this.seen = {};
    }

    /**
     * @param {string} value
     */
    serialize(value) {
      return value
        .toLowerCase()
        .trim()
        // remove html tags
        .replace(/<[!\/a-z].*?>/ig, '')
        // remove unwanted chars
        .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
        .replace(/\s/g, '-');
    }

    /**
     * Finds the next safe (unique) slug to use
     * @param {string} originalSlug
     * @param {boolean} isDryRun
     */
    getNextSafeSlug(originalSlug, isDryRun) {
      let slug = originalSlug;
      let occurenceAccumulator = 0;
      if (this.seen.hasOwnProperty(slug)) {
        occurenceAccumulator = this.seen[originalSlug];
        do {
          occurenceAccumulator++;
          slug = originalSlug + '-' + occurenceAccumulator;
        } while (this.seen.hasOwnProperty(slug));
      }
      if (!isDryRun) {
        this.seen[originalSlug] = occurenceAccumulator;
        this.seen[slug] = 0;
      }
      return slug;
    }

    /**
     * Convert string to unique id
     * @param {object} [options]
     * @param {boolean} [options.dryrun] Generates the next unique slug without
     * updating the internal accumulator.
     */
    slug(value, options = {}) {
      const slug = this.serialize(value);
      return this.getNextSafeSlug(slug, options.dryrun);
    }
  }

  /**
   * Parsing & Compiling
   */
  class Parser {
    constructor(options) {
      this.options = options || defaults;
      this.options.renderer = this.options.renderer || new Renderer();
      this.renderer = this.options.renderer;
      this.renderer.options = this.options;
      this.textRenderer = new TextRenderer();
      this.slugger = new Slugger();
    }

    /**
     * Static Parse Method
     */
    static parse(tokens, options) {
      const parser = new Parser(options);
      return parser.parse(tokens);
    }

    /**
     * Static Parse Inline Method
     */
    static parseInline(tokens, options) {
      const parser = new Parser(options);
      return parser.parseInline(tokens);
    }

    /**
     * Parse Loop
     */
    parse(tokens, top = true) {
      let out = '',
        i,
        j,
        k,
        l2,
        l3,
        row,
        cell,
        header,
        body,
        token,
        ordered,
        start,
        loose,
        itemBody,
        item,
        checked,
        task,
        checkbox,
        ret;

      const l = tokens.length;
      for (i = 0; i < l; i++) {
        token = tokens[i];

        // Run any renderer extensions
        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
          if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
            out += ret || '';
            continue;
          }
        }

        switch (token.type) {
          case 'space': {
            continue;
          }
          case 'hr': {
            out += this.renderer.hr();
            continue;
          }
          case 'heading': {
            out += this.renderer.heading(
              this.parseInline(token.tokens),
              token.depth,
              unescape(this.parseInline(token.tokens, this.textRenderer)),
              this.slugger);
            continue;
          }
          case 'code': {
            out += this.renderer.code(token.text,
              token.lang,
              token.escaped);
            continue;
          }
          case 'table': {
            header = '';

            // header
            cell = '';
            l2 = token.header.length;
            for (j = 0; j < l2; j++) {
              cell += this.renderer.tablecell(
                this.parseInline(token.header[j].tokens),
                { header: true, align: token.align[j] }
              );
            }
            header += this.renderer.tablerow(cell);

            body = '';
            l2 = token.rows.length;
            for (j = 0; j < l2; j++) {
              row = token.rows[j];

              cell = '';
              l3 = row.length;
              for (k = 0; k < l3; k++) {
                cell += this.renderer.tablecell(
                  this.parseInline(row[k].tokens),
                  { header: false, align: token.align[k] }
                );
              }

              body += this.renderer.tablerow(cell);
            }
            out += this.renderer.table(header, body);
            continue;
          }
          case 'blockquote': {
            body = this.parse(token.tokens);
            out += this.renderer.blockquote(body);
            continue;
          }
          case 'list': {
            ordered = token.ordered;
            start = token.start;
            loose = token.loose;
            l2 = token.items.length;

            body = '';
            for (j = 0; j < l2; j++) {
              item = token.items[j];
              checked = item.checked;
              task = item.task;

              itemBody = '';
              if (item.task) {
                checkbox = this.renderer.checkbox(checked);
                if (loose) {
                  if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                    item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                    if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                      item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                    }
                  } else {
                    item.tokens.unshift({
                      type: 'text',
                      text: checkbox
                    });
                  }
                } else {
                  itemBody += checkbox;
                }
              }

              itemBody += this.parse(item.tokens, loose);
              body += this.renderer.listitem(itemBody, task, checked);
            }

            out += this.renderer.list(body, ordered, start);
            continue;
          }
          case 'html': {
            // TODO parse inline content if parameter markdown=1
            out += this.renderer.html(token.text);
            continue;
          }
          case 'paragraph': {
            out += this.renderer.paragraph(this.parseInline(token.tokens));
            continue;
          }
          case 'text': {
            body = token.tokens ? this.parseInline(token.tokens) : token.text;
            while (i + 1 < l && tokens[i + 1].type === 'text') {
              token = tokens[++i];
              body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
            }
            out += top ? this.renderer.paragraph(body) : body;
            continue;
          }

          default: {
            const errMsg = 'Token with "' + token.type + '" type was not found.';
            if (this.options.silent) {
              console.error(errMsg);
              return;
            } else {
              throw new Error(errMsg);
            }
          }
        }
      }

      return out;
    }

    /**
     * Parse Inline Tokens
     */
    parseInline(tokens, renderer) {
      renderer = renderer || this.renderer;
      let out = '',
        i,
        token,
        ret;

      const l = tokens.length;
      for (i = 0; i < l; i++) {
        token = tokens[i];

        // Run any renderer extensions
        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
          if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
            out += ret || '';
            continue;
          }
        }

        switch (token.type) {
          case 'escape': {
            out += renderer.text(token.text);
            break;
          }
          case 'html': {
            out += renderer.html(token.text);
            break;
          }
          case 'link': {
            out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
            break;
          }
          case 'image': {
            out += renderer.image(token.href, token.title, token.text);
            break;
          }
          case 'strong': {
            out += renderer.strong(this.parseInline(token.tokens, renderer));
            break;
          }
          case 'em': {
            out += renderer.em(this.parseInline(token.tokens, renderer));
            break;
          }
          case 'codespan': {
            out += renderer.codespan(token.text);
            break;
          }
          case 'br': {
            out += renderer.br();
            break;
          }
          case 'del': {
            out += renderer.del(this.parseInline(token.tokens, renderer));
            break;
          }
          case 'text': {
            out += renderer.text(token.text);
            break;
          }
          default: {
            const errMsg = 'Token with "' + token.type + '" type was not found.';
            if (this.options.silent) {
              console.error(errMsg);
              return;
            } else {
              throw new Error(errMsg);
            }
          }
        }
      }
      return out;
    }
  }

  /**
   * Marked
   */
  function marked(src, opt, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected');
    }

    if (typeof opt === 'function') {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);

    if (callback) {
      const highlight = opt.highlight;
      let tokens;

      try {
        tokens = Lexer.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      const done = function(err) {
        let out;

        if (!err) {
          try {
            if (opt.walkTokens) {
              marked.walkTokens(tokens, opt.walkTokens);
            }
            out = Parser.parse(tokens, opt);
          } catch (e) {
            err = e;
          }
        }

        opt.highlight = highlight;

        return err
          ? callback(err)
          : callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;

      if (!tokens.length) return done();

      let pending = 0;
      marked.walkTokens(tokens, function(token) {
        if (token.type === 'code') {
          pending++;
          setTimeout(() => {
            highlight(token.text, token.lang, function(err, code) {
              if (err) {
                return done(err);
              }
              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }

              pending--;
              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });

      if (pending === 0) {
        done();
      }

      return;
    }

    function onError(e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if (opt.silent) {
        return '<p>An error occurred:</p><pre>'
          + escape(e.message + '', true)
          + '</pre>';
      }
      throw e;
    }

    try {
      const tokens = Lexer.lex(src, opt);
      if (opt.walkTokens) {
        if (opt.async) {
          return Promise.all(marked.walkTokens(tokens, opt.walkTokens))
            .then(() => {
              return Parser.parse(tokens, opt);
            })
            .catch(onError);
        }
        marked.walkTokens(tokens, opt.walkTokens);
      }
      return Parser.parse(tokens, opt);
    } catch (e) {
      onError(e);
    }
  }

  /**
   * Options
   */

  marked.options =
  marked.setOptions = function(opt) {
    merge(marked.defaults, opt);
    changeDefaults(marked.defaults);
    return marked;
  };

  marked.getDefaults = getDefaults;

  marked.defaults = defaults;

  /**
   * Use Extension
   */

  marked.use = function(...args) {
    const opts = merge({}, ...args);
    const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };
    let hasExtensions;

    args.forEach((pack) => {
      // ==-- Parse "addon" extensions --== //
      if (pack.extensions) {
        hasExtensions = true;
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error('extension name required');
          }
          if (ext.renderer) { // Renderer extensions
            const prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;
            if (prevRenderer) {
              // Replace extension with func to run new extension but fall back if false
              extensions.renderers[ext.name] = function(...args) {
                let ret = ext.renderer.apply(this, args);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if (ext.tokenizer) { // Tokenizer Extensions
            if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            if (extensions[ext.level]) {
              extensions[ext.level].unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) { // Function to check for start of token
              if (ext.level === 'block') {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === 'inline') {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if (ext.childTokens) { // Child tokens to be visited by walkTokens
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
      }

      // ==-- Parse "overwrite" extensions --== //
      if (pack.renderer) {
        const renderer = marked.defaults.renderer || new Renderer();
        for (const prop in pack.renderer) {
          const prevRenderer = renderer[prop];
          // Replace renderer with func to run extension, but fall back if false
          renderer[prop] = (...args) => {
            let ret = pack.renderer[prop].apply(renderer, args);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args);
            }
            return ret;
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = marked.defaults.tokenizer || new Tokenizer();
        for (const prop in pack.tokenizer) {
          const prevTokenizer = tokenizer[prop];
          // Replace tokenizer with func to run extension, but fall back if false
          tokenizer[prop] = (...args) => {
            let ret = pack.tokenizer[prop].apply(tokenizer, args);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }

      // ==-- Parse WalkTokens extensions --== //
      if (pack.walkTokens) {
        const walkTokens = marked.defaults.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(pack.walkTokens.call(this, token));
          if (walkTokens) {
            values = values.concat(walkTokens.call(this, token));
          }
          return values;
        };
      }

      if (hasExtensions) {
        opts.extensions = extensions;
      }

      marked.setOptions(opts);
    });
  };

  /**
   * Run callback for every token
   */

  marked.walkTokens = function(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(marked, token));
      switch (token.type) {
        case 'table': {
          for (const cell of token.header) {
            values = values.concat(marked.walkTokens(cell.tokens, callback));
          }
          for (const row of token.rows) {
            for (const cell of row) {
              values = values.concat(marked.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case 'list': {
          values = values.concat(marked.walkTokens(token.items, callback));
          break;
        }
        default: {
          if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) { // Walk any extensions
            marked.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
              values = values.concat(marked.walkTokens(token[childTokens], callback));
            });
          } else if (token.tokens) {
            values = values.concat(marked.walkTokens(token.tokens, callback));
          }
        }
      }
    }
    return values;
  };

  /**
   * Parse Inline
   * @param {string} src
   */
  marked.parseInline = function(src, opt) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked.parseInline(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked.parseInline(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected');
    }

    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);

    try {
      const tokens = Lexer.lexInline(src, opt);
      if (opt.walkTokens) {
        marked.walkTokens(tokens, opt.walkTokens);
      }
      return Parser.parseInline(tokens, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if (opt.silent) {
        return '<p>An error occurred:</p><pre>'
          + escape(e.message + '', true)
          + '</pre>';
      }
      throw e;
    }
  };

  /**
   * Expose
   */
  marked.Parser = Parser;
  marked.parser = Parser.parse;
  marked.Renderer = Renderer;
  marked.TextRenderer = TextRenderer;
  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;
  marked.Tokenizer = Tokenizer;
  marked.Slugger = Slugger;
  marked.parse = marked;

  marked.options;
  marked.setOptions;
  marked.use;
  marked.walkTokens;
  marked.parseInline;
  Parser.parse;
  Lexer.lex;

  // Override function
  var customRenderer = {
    /**
     * @param {string} text
     */
    paragraph: function paragraph(text) {
      // Allow extended attributes on paragraphs
      var params = text.match(/{[a-zA-Z0-9 #;:=_\-[\].]+}$/),
        attributes = [],
        attributeKeys = [];
      if (params !== null && params.length >= 1) {
        // Trim the {...} off the parameters
        params = params[0].substring(1, params[0].length - 1);
        // Trim the entire string off the end of the text now that we have the parameters
        text = text.substring(0, text.length - params.length - 2);
        // Split them by spaces (multiple parameters can be attributed at a time)
        params = params.split(' ');

        // Process each parameter into a manageable array
        params.forEach(function (p) {
          var k, v, idx;
          if (p[0] === '.') {
            // Shorthand for class
            k = 'class';
            v = p.substring(1);
          } else if (p[0] === '#') {
            // Shorthand for ID
            k = 'id';
            v = p.substring(1);
          } else if (p.indexOf('=') !== -1) {
            // Custom key/value attribute
            k = p.substring(0, p.indexOf('='));
            v = p.substring(p.indexOf('=') + 1);
          } else {
            console.warn('Unknown/unsupported attribute string ' + p);
            return;
          }
          if (attributeKeys.indexOf(k) === -1) {
            // New attribute
            attributeKeys.push(k);
            if (k === 'class') {
              // Class supports multiple
              attributes.push({
                key: k,
                value: []
              });
            } else {
              attributes.push({
                key: k,
                value: ''
              });
            }
          }
          idx = attributeKeys.indexOf(k);

          // Support for multiple values (select attributes only)
          if (typeof attributes[idx].value === 'string') {
            attributes[idx].value = v;
          } else {
            attributes[idx].value.push(v);
          }
        });
      }
      if (attributes.length > 0) {
        var attString = attributes.map(function (a) {
          return a.key + '="' + (typeof a.value === 'string' ? a.value : a.value.join(' ')) + '"';
        }).join(' ');
        return '<p ' + attString + '>' + text + '</p>\n';
      } else {
        return "<p>".concat(text, "</p>\n");
      }
    }
  };

  /**
   * CMS.js v2.0.0
   * Copyright 2018 Chris Diana
   * https://chrisdiana.github.io/cms.js
   * Free to use under the MIT license.
   * http://www.opensource.org/licenses/mit-license.php
   */

  // Load addons
  new PageBodyClass();
  new PageList();

  // Load marked addons
  marked.use({
    renderer: customRenderer
  });

  // Make available in global space
  window.marked = marked;
  var main = (function (options) {
    return new CMS(window, options);
  });

  return main;

})();
