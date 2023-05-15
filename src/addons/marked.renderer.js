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

/*eslint quotes: "off"*/

/**
 * Add an attribute key/value pair to the list of attributes
 *
 * Used to standardize various shorthand declarations to their usable format,
 * meant to be called once-per-pair
 *
 * For example, the following shorthands are supported:
 * '.red' value can be passed with no key for a class name
 * '#thing' value can be passed with no key for an ID
 */
function _process_attributes_finalize(attributes, key, value, quote_style) {
  if (key == null && value[0] == '.') {
    key = 'class';
    value = value.substr(1);
  }
  else if (key == null && value[0] == '#') {
    key = 'id';
    value = value.substr(1);
  }

  if (typeof(attributes[key]) === 'undefined') {
    attributes[key] = {
      values: [ value ],
      quote_style: quote_style,
    };
  }
  else {
    attributes[key].values.push(value);
  }
}

/**
 * Process all markdown extended attributes as a string into their individual parts
 *
 * Will return a list of every key with its values and any quotations required
 * note, each value will be an array of values, generally used for classes, but
 * available for everything (except IDs).
 */
function process_attributes(attribute_string) {
  let in_quote = false,
    quote_style = null,
    attributes = {},
    key = null,
    buffer = '';

  for(let i = 0; i < attribute_string.length; i++) {
    // current letter
    let token = attribute_string[i];
    if (in_quote && token == quote_style) {
      // End of quoted text, stop quoted capture
      in_quote = false;
    }
    else if (in_quote) {
      // Quoted capture, just capture it directly
      buffer += token;
    }
    else if (token == '=' && buffer != '') {
      // A '=' signifies a separation of a key attribute and its value
      key = buffer;
      buffer = '';
    }
    else if(token == '"' || token == "'") {
      in_quote = true;
      quote_style = token;
    }
    else if (token == ' ') {
      // Attributes are space separated (unless inside a quoted string which is caught above)
      _process_attributes_finalize(attributes, key, buffer, quote_style);
      quote_style = null;
      buffer = '';
      key = null;
    }
    else {
      // Default capture, either key or buffer, we'll figure that out later.
      buffer += token;
    }
  }

  // After processing the last record, process that last snippet
  _process_attributes_finalize(attributes, key, buffer, quote_style);

  return attributes;
}

/**
 * Flatten a processed list of attributes (key, values, quote_style),
 * to a flat string to be sent directly to the browser
 */
function process_attributes_flatten(attributes) {
  let results = [];
  // Everything processed, compile into a flat string
  for(let k in attributes) {
    let v = k + '=';

    if (attributes[k].quote_style === null) {
      // Default to double quotes
      attributes[k].quote_style = '"';
    }

    if (k === 'id') {
      // Hard code to only support one ID (to keep people from doing something silly)
      v += attributes[k].quote_style + attributes[k].values[0] + attributes[k].quote_style;
    }
    else {
      // Everything else can have multiple if they want.
      v += attributes[k].quote_style + attributes[k].values.join(' ') + attributes[k].quote_style;
    }

    results.push(v);
  }

  return results.join(' ');
}

// Override function
export default {
  /**
   * @param {string} text
   */
  paragraph(text) {
    // Allow extended attributes on paragraphs
    let params = text.match(/{[a-zA-Z0-9 #;:=_\-[&\].']+}$/),
      atts = {};
    if (params !== null && params.length >= 1) {
      // Trim the {...} off the parameters
      params = params[0].substring(1, params[0].length - 1);
      // Trim the entire string off the end of the text now that we have the parameters
      text = text.substring(0, text.length - params.length - 2);
      // Paragraphs will escape quotes, that won't do here. (we actually want them)
      params = params.replaceAll('&quot;', '"');
      atts = process_attributes(params);
    }

    return '<p ' + process_attributes_flatten(atts) + '>' + text + '</p>\n';
  },
  /**
   * @param {string} href
   * @param {string} title
   * @param {string} text
   */
  link(data) {
    let atts = data.attributes ? process_attributes(data.attributes) : {},
      text = this.parser.parseInline(data.tokens, this.parser.renderer);

    if (data.href === null) {
      return text;
    }

    // Add the system attributes
    atts['href'] = {
      values: [ data.href ],
      quote_style: '"'
    };

    if (data.title) {
      atts['title'] = {
        values: [ data.title ],
        quote_style: '"'
      };
    }

    return '<a ' + process_attributes_flatten(atts) + '>' + text + '</a>';
  },
  /**
   * @param {string} href
   * @param {string} title
   * @param {string} text
   */
  image(data) {
    let atts = data.attributes ? process_attributes(data.attributes) : {};

    if (data.href === null) {
      return data.text;
    }

    // Add the system attributes
    atts['src'] = {
      values: [ data.href ],
      quote_style: '"'
    };

    if (data.text) {
      atts['alt'] = {
        values: [ data.text ],
        quote_style: '"'
      };
    }

    if (data.title) {
      atts['title'] = {
        values: [ data.title ],
        quote_style: '"'
      };
    }

    return '<img ' + process_attributes_flatten(atts) + '/>';
  }
};
