/**
 * MarkdownMaster CMS
 *
 * The MIT License (MIT)
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

export default class {

  constructor() {

  }

  init() {

    /**
     * Called after any page load operation
     *
     * When using function() syntax, 'this' will point to the CMS object,
     * arrow function syntax 'site.onroute = () => { ... }' will be anonymous and detached.
     *
     * Either option is acceptable, just depending on your needs/preferences.
     * @method
     * @param {FileCollection[]|null} view.collection Collection of files to view for listing pages
     * @param {File|null} view.file Single file to view when available
     * @param {string} view.mode Type of view, usually either "list", "single", or error.
     * @param {string} view.query Any search query
     * @param {string} view.tag Any tag selected to view
     * @param {string} view.type Content type selected
     */
    document.addEventListener('cms:route', event => {
      document.querySelectorAll('[data-plugin="cms:search"]').forEach(el => {
        if (el.dataset.loaded !== '1') {
          el.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
              event.detail.cms.search(e.target.dataset.type, e.target.value);
            }
          });
        }
      });
    });
  }
}

