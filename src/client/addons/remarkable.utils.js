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

/**
 * Copy of functions from the remarkable source code to support custom functionality
 */

/*
var utils = Object.freeze({
	isString: isString,
	has: has$1,
	assign: assign,
	unescapeMd: unescapeMd,
	isValidEntityCode: isValidEntityCode,
	fromCodePoint: fromCodePoint,
	replaceEntities: replaceEntities,
	escapeHtml: escapeHtml
});
*/
import {utils} from 'remarkable';
import {AttributeBuilder} from '../utils';

export const CHAR = {
	LF         : 0x0A,
	SPACE      : 0x20,
	EXCLAIM    : 0x21,
	DBLQUOTE   : 0x22,
	POUND      : 0x23,
	SNGQUOTE   : 0x27,
	OPNPARAN   : 0x28,
	CLSPARAN   : 0x29,
	SLASH      : 0x2F,
	LESSTHAN   : 0x3C,
	EQUAL      : 0x3D,
	GREATERTHAN: 0x3E,
	QUESTION   : 0x3F,
	OPNBRACKET : 0x5B,
	BACKSLASH  : 0x5C,
	CLSBRACKET : 0x5D,
	a          : 0x61,
	z          : 0x7A,
	OPNBRACE   : 0x7B,
	CLSBRACE   : 0x7D,
	DEL        : 0x7F
};

/**
 * Parse link labels
 *
 * This function assumes that first character (`[`) already matches;
 * returns the end of the label.
 *
 * @param  {Object} state
 * @param  {Number} start
 * @api private
 */
export function parseLinkLabel(state, start) {
	let level, found, marker,
		labelEnd = -1,
		max = state.posMax,
		oldPos = state.pos,
		oldFlag = state.isInLabel;

	if (state.isInLabel) { return -1; }

	if (state.labelUnmatchedScopes) {
		state.labelUnmatchedScopes--;
		return -1;
	}

	state.pos = start + 1;
	state.isInLabel = true;
	level = 1;

	while (state.pos < max) {
		marker = state.src.charCodeAt(state.pos);
		if (marker === CHAR.OPNBRACKET /* [ */) {
			level++;
		} else if (marker === CHAR.CLSBRACKET /* ] */) {
			level--;
			if (level === 0) {
				found = true;
				break;
			}
		}

		state.parser.skipToken(state);
	}

	if (found) {
		labelEnd = state.pos;
		state.labelUnmatchedScopes = 0;
	} else {
		state.labelUnmatchedScopes = level - 1;
	}

	// restore old state
	state.pos = oldPos;
	state.isInLabel = oldFlag;

	return labelEnd;
}

/**
 * Parse link destination
 *
 *   - on success it returns a string and updates state.pos;
 *   - on failure it returns null
 *
 * @param  {Object} state
 * @param  {Number} pos
 * @api private
 */
export function parseLinkDestination(state, pos) {
	let code, level, link,
		start = pos,
		max = state.posMax;

	if (state.src.charCodeAt(pos) === CHAR.LESSTHAN /* < */) {
		pos++;
		while (pos < max) {
			code = state.src.charCodeAt(pos);
			if (code === CHAR.LF /* \n */) { return false; }
			if (code === CHAR.GREATERTHAN /* > */) {
				link = normalizeLink(utils.unescapeMd(state.src.slice(start + 1, pos)));
				if (!state.parser.validateLink(link)) { return false; }
				state.pos = pos + 1;
				state.linkContent = link;
				return true;
			}
			if (code === CHAR.BACKSLASH /* \ */ && pos + 1 < max) {
				pos += 2;
				continue;
			}

			pos++;
		}

		// no closing '>'
		return false;
	}

	// this should be ... } else { ... branch

	level = 0;
	while (pos < max) {
		code = state.src.charCodeAt(pos);

		if (code === CHAR.SPACE) { break; }

		// ascii control chars
		if (code < CHAR.SPACE || code === CHAR.DEL) { break; }

		if (code === CHAR.BACKSLASH /* \ */ && pos + 1 < max) {
			pos += 2;
			continue;
		}

		if (code === CHAR.OPNPARAN /* ( */) {
			level++;
			if (level > 1) { break; }
		}

		if (code === CHAR.CLSPARAN /* ) */) {
			level--;
			if (level < 0) { break; }
		}

		pos++;
	}

	if (start === pos) { return false; }

	link = utils.unescapeMd(state.src.slice(start, pos));
	if (!state.parser.validateLink(link)) { return false; }

	state.linkContent = link;
	state.pos = pos;
	return true;
}

function normalizeLink(url) {
	let normalized = utils.replaceEntities(url);
	// We shouldn't care about the result of malformed URIs,
	// and should not throw an exception.
	try {
		normalized = decodeURI(normalized);
	} catch (err) {
		console.log(err, {normalized});
	}
	return encodeURI(normalized);
}

/**
 * Parse link title
 *
 *   - on success it returns a string and updates state.pos;
 *   - on failure it returns null
 *
 * @param  {Object} state
 * @param  {Number} pos
 * @api private
 */
export function parseLinkTitle(state, pos) {
	let code,
		start = pos,
		max = state.posMax,
		marker = state.src.charCodeAt(pos);

	if (marker !== CHAR.DBLQUOTE /* " */ && marker !== CHAR.SNGQUOTE /* ' */ && marker !== CHAR.OPNPARAN /* ( */) { return false; }

	pos++;

	// if opening marker is "(", switch it to closing marker ")"
	if (marker === CHAR.OPNPARAN) { marker = CHAR.CLSPARAN; }

	while (pos < max) {
		code = state.src.charCodeAt(pos);
		if (code === marker) {
			state.pos = pos + 1;
			state.linkContent = utils.unescapeMd(state.src.slice(start + 1, pos));
			return true;
		}
		if (code === CHAR.BACKSLASH /* \ */ && pos + 1 < max) {
			pos += 2;
			continue;
		}

		pos++;
	}

	return false;
}

/**
 * Parse extended HTML attributes for nodes
 *
 * ie: {.classname #some_id att=value att2=another}
 *
 *   - on success it returns a string and updates state.pos;
 *   - on failure it returns null
 *
 * @param  {Object} state
 * @param  {Number} pos
 * @api private
 */
export function parseExtendedAttributes(state, pos) {
	let code,
		start = pos,
		max = state.posMax,
		marker = state.src.charCodeAt(pos);

	if (marker !== CHAR.OPNBRACE) { return false; }

	pos++;

	while (pos < max) {
		code = state.src.charCodeAt(pos);
		if (code === CHAR.CLSBRACE) {
			state.pos = pos + 1;
			state.attributes = new AttributeBuilder(state.src.slice(start + 1, pos));
			return true;
		}
		if (code === CHAR.BACKSLASH && pos + 1 < max) {
			// Skip backslash characters (to allow escaping braces)
			pos += 2;
			continue;
		}

		pos++;
	}

	return false;
}

export function normalizeReference(str) {
	// use .toUpperCase() instead of .toLowerCase()
	// here to avoid a conflict with Object.prototype
	// members (most notably, `__proto__`)
	return str.trim().replace(/\s+/g, ' ').toUpperCase();
}