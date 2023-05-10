/**
 * CMS.js
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

import { get } from './utils';
import { messages as msg, handleMessage } from './messages';

/**
 * Templating function that renders HTML templates.
 * @function
 * @param {string} text - HTML text to be evaluated.
 * @returns {string} Rendered template with injected data.
 */
export function Templater(text) {
  return new Function(
    'data',
    'var output=' +
    JSON.stringify(text)
      .replace(/<%=(.+?)%>/g, '"+($1)+"')
      .replace(/<%(.+?)%>/g, '";$1\noutput+="') +
    ';return output;'
  );
}

/**
 * Load template from URL.
 * @function
 * @async
 * @param {string} url - URL of template to load.
 * @param {object} data - Data to load into template.
 * @param {function} callback - Callback function
 */
export function loadTemplate(url, data, callback) {
  get(url, (success, error) => {
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
export function renderLayout(layout, config, data, callback) {
  //config.container.innerHTML = '';
  var url = [config.webpath, config.layoutDirectory, '/', layout, '.html'].join('');
  loadTemplate(url, data, (success, error) => {
    if (error) {
      handleMessage(msg['LAYOUT_LOAD_ERROR']);
      callback(null, error);
    } else {
      config.container.innerHTML = success;
      callback('rendered', null);
    }
  });
}
