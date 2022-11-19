// Override function
export default {
  /**
   * @param {string} text
   */
  paragraph(text) {
    // Allow extended attributes on paragraphs
    let params = text.match(/{[a-zA-Z0-9 #;:=_\-[\].]+}$/),
      attributes = [],
      attributeKeys = [];
    
    if (params !== null && params.length >= 1) {
      // Trim the {...} off the parameters
      params = params[0].substring(1, params[0].length - 1);
      // Trim the entire string off the end of the text now that we have the parameters
      text = text.substring(0, text.length - params.length - 2);
      // Split them by spaces (multiple parameters can be attributed at a time)
      params = params.split(' ');

      // Process each parameter into a manageable array
      params.forEach(p => {
        let k, v, idx;
        if (p[0] === '.') {
          // Shorthand for class
          k = 'class';
          v = p.substring(1);
        } else if (p[0] === '#') {
          // Shorthand for ID
          k = 'id';
          v = p.substring(1);
        } else if(p.indexOf('=') !== -1) {
          // Custom key/value attribute
          k = p.substring(0, p.indexOf('='));
          v = p.substring(p.indexOf('=') + 1);
        } else {
          console.warn('Unknown/unsupported attribute string ' + p);
          return;
        }

        if (attributeKeys.indexOf(k) === -1) {
          // New attribute
          attributeKeys.push(k);
          if (k === 'class') {
            // Class supports multiple
            attributes.push({key: k, value: []});
          } else {
            attributes.push({key: k, value: ''});
          }
          
        }

        idx = attributeKeys.indexOf(k);

        // Support for multiple values (select attributes only)
        if (typeof(attributes[idx].value) === 'string') {
          attributes[idx].value = v;
        } else {
          attributes[idx].value.push(v);
        }
      });
    }

    if (attributes.length > 0) {
      let attString = (attributes.map(a => {
        return a.key + '="' + (typeof(a.value) === 'string' ? a.value : a.value.join(' ')) + '"';
      })).join(' ');

      return '<p ' + attString + '>' + text + '</p>\n';
    } else {
      return `<p>${text}</p>\n`;
    }
  }
};
