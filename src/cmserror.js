/**
 * @constructor
 * @param {int}    code    HTTP status code (usually 404 or 500)
 * @param {string} message Error message text
 */
class CMSError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }

  toString() {
    return '[' + this.code + '] ' + this.message;
  }
}

export default CMSError;