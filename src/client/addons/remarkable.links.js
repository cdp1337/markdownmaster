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
	normalizeReference,
	parseLinkDestination,
	parseLinkLabel,
	parseLinkTitle,
	CHAR,
	parseExtendedAttributes
} from './remarkable.utils';
import {AttributeBuilder} from '../utils';
import {utils} from 'remarkable';


export default (remarkable) => {
	remarkable.inline.ruler.at('links', (state, silent) => {
		let labelStart,
			labelEnd,
			label,
			href,
			title,
			pos,
			ref,
			code,
			attributes = null,
			isImage = false,
			oldPos = state.pos,
			max = state.posMax,
			start = state.pos,
			marker = state.src.charCodeAt(start);

		if (marker === CHAR.EXCLAIM) {
			isImage = true;
			marker = state.src.charCodeAt(++start);
		}

		if (marker !== CHAR.OPNBRACKET) { return false; }
		if (state.level >= state.options.maxNesting) { return false; }

		labelStart = start + 1;
		labelEnd = parseLinkLabel(state, start);

		// parser failed to find ']', so it's not a valid link
		if (labelEnd < 0) { return false; }

		pos = labelEnd + 1;
		if (pos < max && state.src.charCodeAt(pos) === CHAR.OPNPARAN) {
			//
			// Inline link
			//

			// [link](  <href>  "title"  )
			//        ^^ skipping these spaces
			pos++;
			for (; pos < max; pos++) {
				code = state.src.charCodeAt(pos);
				if (code !== CHAR.SPACE && code !== CHAR.LF) { break; }
			}
			if (pos >= max) { return false; }

			// [link](  <href>  "title"  )
			//          ^^^^^^ parsing link destination
			start = pos;
			if (parseLinkDestination(state, pos)) {
				href = state.linkContent;
				pos = state.pos;
			} else {
				href = '';
			}

			// [link](  <href>  "title"  )
			//                ^^ skipping these spaces
			start = pos;
			for (; pos < max; pos++) {
				code = state.src.charCodeAt(pos);
				if (code !== CHAR.SPACE && code !== CHAR.LF) { break; }
			}

			// [link](  <href>  "title"  )
			//                  ^^^^^^^ parsing link title
			if (pos < max && start !== pos && parseLinkTitle(state, pos)) {
				title = state.linkContent;
				pos = state.pos;

				// [link](  <href>  "title"  )
				//                         ^^ skipping these spaces
				for (; pos < max; pos++) {
					code = state.src.charCodeAt(pos);
					if (code !== CHAR.SPACE && code !== CHAR.LF) { break; }
				}
			} else {
				title = '';
			}

			if (pos >= max || state.src.charCodeAt(pos) !== CHAR.CLSPARAN) {
				state.pos = oldPos;
				return false;
			}
			pos++;

			start = pos;
			// [link](  <href>  "title"  )  {...}
			//                            ^^ skipping these spaces
			for (; pos < max; pos++) {
				code = state.src.charCodeAt(pos);
				if (code !== CHAR.SPACE) { break; }
			}
			if (parseExtendedAttributes(state, pos)) {
				attributes = state.attributes;
				pos = state.pos;
			} else {
				// Reset (spaces after a link are probably important)
				pos = start;
			}

		} else {
			//
			// Link reference
			//

			// do not allow nested reference links
			if (state.linkLevel > 0) { return false; }

			// [foo]  [bar]
			//      ^^ optional whitespace (can include newlines)
			for (; pos < max; pos++) {
				code = state.src.charCodeAt(pos);
				if (code !== CHAR.SPACE && code !== CHAR.LF) { break; }
			}

			if (pos < max && state.src.charCodeAt(pos) === CHAR.OPNBRACKET) {
				start = pos + 1;
				pos = parseLinkLabel(state, pos);
				if (pos >= 0) {
					label = state.src.slice(start, pos++);
				} else {
					pos = start - 1;
				}
			}

			// covers label === '' and label === undefined
			// (collapsed reference link and shortcut reference link respectively)
			if (!label) {
				if (typeof label === 'undefined') {
					pos = labelEnd + 1;
				}
				label = state.src.slice(labelStart, labelEnd);
			}

			ref = state.env.references[normalizeReference(label)];
			if (!ref) {
				state.pos = oldPos;
				return false;
			}
			href = ref.href;
			title = ref.title;
		}

		//
		// We found the end of the link, and know for a fact it's a valid link;
		// so all that's left to do is to call tokenizer.
		//
		if (!silent) {
			state.pos = labelStart;
			state.posMax = labelEnd;

			if (isImage) {
				state.push({
					type: 'image',
					src: href,
					title: title,
					alt: state.src.substr(labelStart, labelEnd - labelStart),
					attributes: attributes,
					level: state.level
				});
			} else {
				state.push({
					type: 'link_open',
					href: href,
					title: title,
					attributes: attributes,
					level: state.level++
				});
				state.linkLevel++;
				state.parser.tokenize(state);
				state.linkLevel--;
				state.push({ type: 'link_close', level: --state.level });
			}
		}

		state.pos = pos;
		state.posMax = max;
		return true;
	});

	remarkable.renderer.rules['image'] = (tokens, idx, options) => {
		let atts = tokens[idx].attributes ?? new AttributeBuilder(),
			suffix = options.xhtmlOut ? ' /' : '';

		atts.addAttribute('src', tokens[idx].src);
		if (tokens[idx].title) {
			atts.addAttribute('title', tokens[idx].title);
		}
		atts.addAttribute('alt', utils.unescapeMd(tokens[idx].alt));

		return '<img ' + atts.asString() + suffix + '>';
	};

	remarkable.renderer.rules['link_open'] = (tokens, idx, options) => {
		let atts = tokens[idx].attributes ?? new AttributeBuilder();

		atts.addAttribute('href', tokens[idx].href);
		if (tokens[idx].title) {
			atts.addAttribute('title', tokens[idx].title);
		}
		if (options.linkTarget) {
			atts.addAttribute('target', options.linkTarget);
		}

		return '<a ' + atts.asString() + '>';
	};
};
