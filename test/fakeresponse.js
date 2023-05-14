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