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

// Match against "*[Str]: ...
const abbr_regex = /^\*\[(.*?)]: (.+)$/;

export default {
	name: 'abbr',
	level: 'inline',
	/**
	 * @param {string} data.title
	 * @param {string} data.raw
	 * @param {array} data.tokens
	 * @param {string} data.type
	 */
	renderer(data) {
		if (data.raw !== '' && data.title !== '') {
			return '<abbr title="' + data.title + '">' + data.raw + '</abbr>';
		} else {
			return '';
		}
	},
	tokenizer(src) {
		const cap = abbr_regex.exec(src);
		if (cap) {
			let search = new RegExp('(.*[^a-zA-Z0-9])' + cap[1] + '([^a-zA-Z0-9])');

			this.lexer.tokens.forEach(block => {
				// Only run on certain tokens
				if (block.type === 'paragraph') {
					let newTokens = [];
					block.tokens.forEach(token => {
						let match;
						if (token.type === 'text') {
							while(( match = token.text.match(search)) !== null) {
								//console.log(match);
								newTokens.push({
									type: 'text',
									raw: match[1],
									text: match[1]
								});
								newTokens.push({
									type: 'abbr',
									raw: cap[1],
									title: cap[2]
								});
								token.text = token.text.substring(cap[1].length + match[1].length);
							}
							newTokens.push({
								type: 'text',
								raw: token.text,
								text: token.text
							});
						} else {
							newTokens.push(token);
						}
					});
					block.tokens = newTokens;
				}
			});

			return false;
		}
	}
};
