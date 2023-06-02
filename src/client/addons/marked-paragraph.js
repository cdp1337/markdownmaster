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

import {attributeStringToObject, attributeObjectToString} from '../utils';

//const p_regex = /^([^\n]+(?:\n(?! {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)| {0,3}#{1,6} | {0,3}>| {0,3}(?:`{3,}(?=[^`\n]*\n)|~{3,})[^\n]*\n| {0,3}(?:[*+-]|1[.)]) |<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?: +|\n|\/?>)|<(?:script|pre|style|textarea|!--)| +\n)[^\n]+)*)/;
const p_regex = /^(?!#{1,5}|\*|\|)/;

export default {
	name: 'paragraph',
	level: 'block',
	/**
	 * @param {string} data.raw
	 * @param {string} data.text
	 * @param {array} data.tokens
	 * @param {string} data.type
	 */
	renderer(data) {
		// Allow extended attributes on paragraphs
		let params = data.text.match(/{[a-zA-Z0-9 #;:=_\-[&\].']+}$/),
			atts = {},
			text = this.parser.parseInline(data.tokens, this.parser.renderer);

		if (text === '') {
			return '';
		}

		if (params !== null && params.length >= 1) {
			// Trim the {...} off the parameters
			params = params[0].substring(1, params[0].length - 1);
			// Trim the entire string off the end of the text now that we have the parameters
			text = text.substring(0, text.length - params.length - 2);
			// Paragraphs will escape quotes, that won't do here. (we actually want them)
			params = params.replaceAll('&quot;', '"');
			atts = attributeStringToObject(params);
		}

		let attString = attributeObjectToString(atts);
		return (attString === '' ? '<p>' : '<p ' + attString + '>') + text.trim() + '</p>\n';
	},
	tokenizer(src) {
		//console.log(this.lexer.tokenizer.rules.block.paragraph);
		const cap = p_regex.exec(src);
		//const cap = this.lexer.tokenizer.rules.block.paragraph.exec(src);
		if (cap) {
			const text = cap[1].charAt(cap[1].length - 1) === '\n'
				? cap[1].slice(0, -1)
				: cap[1];

			return {
				type: 'paragraph',
				raw: cap[0],
				text,
				tokens: this.lexer.inline(text)
			};
		}
	}
};
