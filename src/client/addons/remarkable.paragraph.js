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

// Paragraph


import {AttributeBuilder, rtrim} from '../utils';

export default (remarkable) => {
	remarkable.block.ruler.at('paragraph', (state, startLine/*, endLine*/) => {
		let endLine, content, terminate, i, l,
			nextLine = startLine + 1,
			terminatorRules, params, atts = null;

		endLine = state.lineMax;

		// jump line-by-line until empty one or EOF
		if (nextLine < endLine && !state.isEmpty(nextLine)) {
			terminatorRules = state.parser.ruler.getRules('paragraph');

			for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
				// this would be a code block normally, but after paragraph
				// it's considered a lazy continuation regardless of what's there
				if (state.tShift[nextLine] - state.blkIndent > 3) { continue; }

				// Some tags can terminate paragraph without empty line.
				terminate = false;
				for (i = 0, l = terminatorRules.length; i < l; i++) {
					if (terminatorRules[i](state, nextLine, endLine, true)) {
						terminate = true;
						break;
					}
				}
				if (terminate) { break; }
			}
		}

		content = state.getLines(startLine, nextLine, state.blkIndent, false);//.trim();

		state.line = nextLine;
		if (content.length) {
			params = content.match(/[ \n]{[a-zA-Z0-9 #;:=_\-[&\].']+}$/);
			if (params !== null && params.length >= 1) {
				// Trim the {...} off the parameters
				params = params[0].substring(2, params[0].length - 1);
				// Trim the entire string off the end of the text now that we have the parameters
				content = rtrim(content.substring(0, content.length - params.length - 3));
				// Paragraphs will escape quotes, that won't do here. (we actually want them)
				params = params.replaceAll('&quot;', '"');
				atts = new AttributeBuilder(params);
			}

			state.tokens.push({
				type: 'paragraph_open',
				tight: false,
				lines: [ startLine, state.line ],
				level: state.level,
				attributes: atts
			});
			state.tokens.push({
				type: 'inline',
				content: content,
				level: state.level + 1,
				lines: [ startLine, state.line ],
				children: []
			});
			state.tokens.push({
				type: 'paragraph_close',
				tight: false,
				level: state.level
			});
		}

		return true;
	});

	remarkable.renderer.rules['paragraph_open'] = (tokens, idx) => {
		if (tokens[idx].tight) {
			return '';
		} else if (tokens[idx].attributes !== null) {
			return '<p ' + tokens[idx].attributes.asString() + '>';
		} else {
			return '<p>';
		}
	};
};