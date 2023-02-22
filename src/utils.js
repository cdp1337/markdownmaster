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
