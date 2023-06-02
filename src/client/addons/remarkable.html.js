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

// HTML block

import {CHAR} from './remarkable.utils';
/* eslint no-useless-escape: "off" */
let HTML_TAG_OPEN_RE = /^<([a-zA-Z-]{1,25})[\s\/>]/;
let HTML_TAG_CLOSE_RE = /^<\/([a-zA-Z-]{1,25})[\s>]/;

function isLetter$1(ch) {
	/*eslint no-bitwise:0*/
	let lc = ch | 0x20; // to lower case
	return (lc >= CHAR.a) && (lc <= CHAR.z);
}

export default (remarkable) => {
	remarkable.block.ruler.at('htmlblock', (state, startLine, endLine, silent) => {
		let ch, match, nextLine,
			pos = state.bMarks[startLine],
			max = state.eMarks[startLine],
			shift = state.tShift[startLine];

		pos += shift;

		if (!state.options.html) { return false; }

		if (shift > 3 || pos + 2 >= max) { return false; }

		if (state.src.charCodeAt(pos) !== CHAR.LESSTHAN) { return false; }

		ch = state.src.charCodeAt(pos + 1);

		if (ch === CHAR.EXCLAIM || ch === CHAR.QUESTION) {
			// Directive start / comment start / processing instruction start
			if (silent) { return true; }

		} else if (ch === CHAR.SLASH || isLetter$1(ch)) {

			// Probably start or end of tag
			if (ch === CHAR.SLASH) {
				// closing tag
				match = state.src.slice(pos, max).match(HTML_TAG_CLOSE_RE);
				if (!match) { return false; }
			} else {
				// opening tag
				match = state.src.slice(pos, max).match(HTML_TAG_OPEN_RE);
				if (!match) { return false; }
			}

			if (silent) { return true; }

		} else {
			return false;
		}

		// If we are here - we detected HTML block.
		// Let's roll down till empty line (block end).
		nextLine = startLine + 1;
		while (nextLine < state.lineMax && !state.isEmpty(nextLine)) {
			nextLine++;
		}

		state.line = nextLine;
		state.tokens.push({
			type: 'htmlblock',
			level: state.level,
			lines: [ startLine, state.line ],
			content: state.getLines(startLine, nextLine, 0, true)
		});

		return true;
	});
};
