/**
 * CMS.js - Custom tokenizers for marked.js
 *
 * The MIT License (MIT)
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

/*eslint no-control-regex: "off"*/
/*eslint no-useless-escape: "off"*/

const link_pattern = /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)(?:\s*\{(.*?)\})?/,
  label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,
  href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/,
  title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/,
  caret = /(^|[^\[])\^/g,
  _escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

let link_regex = link_pattern.source
  .replace('label', label.source.replace(caret, '$1'))
  .replace('href', href.source.replace(caret, '$1'))
  .replace('title', title.source.replace(caret, '$1'));
link_regex = new RegExp(link_regex);

/**
 * @see marked/src/helpers.js
 */
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  const l = str.length;
  let level = 0,
    i = 0;
  for (; i < l; i++) {
    if (str[i] === '\\') {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
 * /c*$/ is vulnerable to REDOS.
 *
 * @param {string} str
 * @param {string} c
 * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
 *
 * @see marked/src/helpers.js
 */
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return '';
  }

  // Length of suffix matching the invert condition.
  let suffLen = 0;

  // Step left until we fail to match the invert condition.
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }

  return str.slice(0, l - suffLen);
}

/**
 * @see marked/src/Tokenizer.js
 */
function outputLink(cap, link, raw, lexer) {
  link.raw = raw;
  if (cap[0].charAt(0) !== '!') {
    lexer.state.inLink = true;
    link.type = 'link';
    link.tokens = lexer.inlineTokens(link.text);
    lexer.state.inLink = false;
  }
  else {
    link.type = 'image';
  }

  return link;
}

// Override function
export default {
  link(src) {
    const cap = link_regex.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (/^</.test(trimmedUrl)) {
        // commonmark requires matching angle brackets
        if (!(/>$/.test(trimmedUrl))) {
          return;
        }

        // ending angle bracket cannot be escaped
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        // find closing parenthesis
        const lastParenIndex = findClosingBracket(cap[2], '()');
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf('!') === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = '';
        }
      }

      let link_data = {
        text: cap[1].replace(/\\([[\]])/g, '$1'),
        href: cap[2].trim(),
        title: cap[3] ? cap[3].slice(1, -1) : '',
        attributes: cap[4],
      };

      if (/^</.test(link_data.href)) {
        link_data.href = link_data.href.slice(1, -1);
      }

      link_data.href = link_data.href.replace(_escapes, '$1');
      link_data.title = link_data.title.replace(_escapes, '$1');
      return outputLink(cap, link_data, cap[0], this.lexer);
    }
  }
};
