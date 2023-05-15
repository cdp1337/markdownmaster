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

let messageContainer;

const messages = {
  NO_FILES_ERROR: 'ERROR: No files in directory',
  ELEMENT_ID_ERROR: 'ERROR: No element ID or ID incorrect. Check "elementId" parameter in config.',
  DIRECTORY_ERROR: 'ERROR: Error getting files. Make sure there is a directory for each type in config with files in it.',
  GET_FILE_ERROR: 'ERROR: Error getting the file',
  LAYOUT_LOAD_ERROR: 'ERROR: Error loading layout. Check the layout file to make sure it exists.',
  NOT_READY_WARNING: 'WARNING: Not ready to perform action',
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

export {
  messages,
  createMessageContainer,
  handleMessage,
};
