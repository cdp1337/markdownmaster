/**
 * CMS.js - Utilities used within the CMS (mostly internal functions)
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

/**
 * AJAX Get utility function.
 * @function
 * @async
 * @param {string} url - URL of the request.
 * @param {function} callback - Callback after request is complete.
 */
export function get(url, callback) {
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onreadystatechange = function() {
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
export function extend(target, opts, callback) {
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
 * Get URL parameter by name.
 * @function
 * @param {string} name - Name of parameter.
 * @param {string} url - URL
 * @returns {string} Parameter value
 */
export function getParameterByName(name, url) {
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
export function getGithubUrl(type, gh) {
  var url = [gh.host, 'repos', gh.username, gh.repo, 'contents', type + '?ref=' + gh.branch];
  if (gh.prefix) url.splice(5, 0, gh.prefix);
  return url.join('/');
}

/**
 * Formats date string to datetime
 * 
 * Accepts dashes or slashes between characters, (to support YYYY/MM/DD URL directories)
 * 
 * @param {string} dateString - Date string to convert.
 * @returns {object} Formatted datetime
 */
export function getDatetime(dateStr) {
  dateStr = dateStr.replaceAll('/', '-');
  var dt = new Date(dateStr);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * (-60000));
}

/**
 * @param {string} filepath - Full file path including file name.
 * @returns {string} filename
 */
export function getFilenameFromPath(filepath) {
  //return filepath.split('\\').pop().split('/').pop();
  return filepath.split('\\').pop();
}
