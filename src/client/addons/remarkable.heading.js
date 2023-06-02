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

import {
	CHAR,
} from './remarkable.utils';
import {AttributeBuilder} from '../utils';

export default (remarkable) => {
	remarkable.block.ruler.at('heading', (state, startLine, endLine, silent) => {
		let ch, level, tmp, id = null,
			pos = state.bMarks[startLine] + state.tShift[startLine],
			max = state.eMarks[startLine];

		if (pos >= max) { return false; }

		ch  = state.src.charCodeAt(pos);

		if (ch !== CHAR.POUND || pos >= max) { return false; }

		// count heading level
		level = 1;
		ch = state.src.charCodeAt(++pos);
		while (ch === CHAR.POUND && pos < max && level <= 6) {
			level++;
			ch = state.src.charCodeAt(++pos);
		}

		if (level > 6 || (pos < max && ch !== CHAR.SPACE)) { return false; }

		if (silent) { return true; }

		// Let's cut tails like '    ###  ' from the end of string

		max = state.skipCharsBack(max, CHAR.SPACE, pos); // space
		tmp = state.skipCharsBack(max, CHAR.POUND, pos); // #
		if (tmp > pos && state.src.charCodeAt(tmp - 1) === CHAR.SPACE) {
			max = tmp;
		}

		state.line = startLine + 1;

		if (pos < max) {
			id = state.src.slice(pos, max).trim();
			// Convert text to valid ID
			// We'll use the attribute builder to process this
			let ab = new AttributeBuilder();
			ab.addAttribute('id', id);
			id = ab.getValue('id');
		}

		state.tokens.push({ type: 'heading_open',
			hLevel: level,
			lines: [ startLine, state.line ],
			level: state.level,
			id: id
		});

		// only if header is not empty
		if (pos < max) {
			state.tokens.push({
				type: 'inline',
				content: state.src.slice(pos, max).trim(),
				level: state.level + 1,
				lines: [ startLine, state.line ],
				children: []
			});
		}
		state.tokens.push({ type: 'heading_close', hLevel: level, level: state.level });

		return true;
	});

	remarkable.renderer.rules['heading_open'] = function(tokens, idx) {
		if (tokens[idx].id) {
			return '<h' + tokens[idx].hLevel + ' id="' + tokens[idx].id + '">';
		} else {
			return '<h' + tokens[idx].hLevel + '>';
		}
	};
};

