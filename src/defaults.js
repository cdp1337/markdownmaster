/**
 * CMS.js - Default options used by the CMS, (can be extended in custom config.js)
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

const defaults = {
  elementId: null,
  layoutDirectory: 'layouts',
  defaultView: null,
  mode: 'SERVER',
  github: null,
  types: [],
  frontMatterSeperator: /^---$/m,
  listAttributes: ['tags'],
  urlAttributes: ['image'],
  dateParser: /\d{4}[-/]\d{2}(?:[-/]\d{2})?/,
  dateFormat: (date) => {
    return [(date.getMonth() + 1), date.getDate(), date.getFullYear()].join('/');
  },
  extension: '.md',
  sort: undefined,
  markdownEngine: null,
  debug: false,
  messageClassName: 'cms-messages',
  webpath: '/',
  titleSearchResults: 'Search Results',
};

export default defaults;
