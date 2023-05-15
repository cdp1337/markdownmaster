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

/**
 * Formats date string to a Date object converted to the user's local timezone
 * 
 * Accepts dashes or slashes between characters, (to support YYYY/MM/DD URL directories)
 * 
 * @param {string|Date} dateStr Date string to convert
 * @returns {Date} Rendered Date object
 */
export function getDatetime(dateStr) {
  let matches, dt;
  if (dateStr instanceof Date) {
    // The input value may be a Date if passed from FrontMatter as a YAML date, allow this.
    dt = dateStr;
  }
  else {
    if ((matches = dateStr.match(/^(1[0-2]|[1-9])\/(3[0-1]|[1-2][0-9]|[0-9])\/((?:20|19)?[0-9][0-9])$/))) {
      // US-based M/d/Y
      if (matches[3] < 100) {
        // Short format year (2-digit)
        matches[3] = '20' + matches[3];
      }

      dateStr = [matches[3], matches[1], matches[2]].join('-');
    }
    dateStr = dateStr.replaceAll('/', '-');
    dt = new Date(dateStr);
  }

  return new Date(dt.getTime() + dt.getTimezoneOffset() * 60000);
}

/**
 * Function to join paths while ensuring each is separated by a slash
 *
 * @param {string} args
 * @returns {string}
 *
 * @example
 * pathJoin('posts', 'topic');
 * // Returns 'posts/topic'
 *
 * pathJoin('posts', 'topic', 'README.md');
 * // Returns 'posts/topic/README.md'
 */
export function pathJoin(...args) {
  let path = '';
  // Lazy person's os.path.join()
  for(let i = 0; i < args.length; i++) {

    if (args[i] === '' || args[i] === null) {
      // Failsafe checks
      continue;
    }

    if (path.endsWith('/') && args[i].startsWith('/')) {
      // If paths are provided as ['/', '/posts'], we don't want to double the slashes.
      path += args[i].substring(1);
    }
    else {
      path += args[i];
    }

    if (i + 1 < args.length && !args[i].endsWith('/')) {
      path += '/';
    }
  }

  return path;
}

/**
 * Get the directory name of the requested file
 *
 * @param {string} path
 * @returns {string}
 */
export function dirname(path) {
  if (path.indexOf('/') === -1) {
    // No slashes, no path
    return '';
  }
  return path.substring(0, path.lastIndexOf('/') + 1);
}

/**
 * Get the basename of a given file, optionally without the extension
 *
 * @param {string} path
 * @param {boolean} [without_extension=false]
 * @returns {string}
 */
export function basename(path, without_extension) {
  if (path.indexOf('/') !== -1) {
    path = path.substring(path.lastIndexOf('/') + 1);
  }

  if (without_extension && path.indexOf('.') !== -1) {
    path = path.substring(0, path.lastIndexOf('.'));
  }

  return path;
}