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

export class FakeResponse {
  constructor() {
    /** @type {null|boolean} */
    this.ok = null;
    /** @type {null|number} */
    this.status = null;
    /** @type {null|string} */
    this.statusText = null;
    /** @type {null|string} */
    this.type = 'application/markdown';
    /** @type {null|string} */
    this.url = 'test://fake.response';
    /** @type {Headers} */
    this.headers = new Headers();
    /** @type {string} */
    this._content = '';
  }

  _setErrorNotFound() {
    this.ok = false;
    this.statusText = 'Not Found';
    this.status = 404;
    this.type = 'text/html';
    this._content = 'Page not found';
  }

  /**
   *
   * @param payload
   * @param mimetype
   * @param {Object<string,string>|null} [headers=null]
   */
  _setSuccessfulContent(payload, mimetype, headers) {
    this.ok = true;
    this.statusText = 'OK';
    this.status = 200;
    this.type = mimetype;
    this._content = payload;

    if (headers) {
      for(let [k, v] of Object.entries(headers)) {
        this.headers.set(k, v);
      }
    }
  }

  async text() {
    return new Promise(resolve => {
      resolve(this._content);
    });
  }
}