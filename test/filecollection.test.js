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

import {describe, expect, it, jest, test} from '@jest/globals';
import {FakeResponse} from './fakeresponse';
import FileCollection from '../src/filecollection';
import {Config} from '../src/config';
import {JSDOM} from 'jsdom';
import File from '../src/file';


const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

describe('FileCollection', () => {
	describe('getFileListUrl', () => {
		// @todo
	});
	describe('getFileUrl', () => {
		// @todo
	});
	describe('getFileElements', () => {
		// @todo
	});
	describe('getFiles', () => {
		// @todo
	});
	describe('scanDirectory', () => {
		const good_contents = `<html><body>
<a href="../">../</a>
<a href="subtopics/">subtopics/</a>
<a href="img.png">img.png</a>
<a href="topic.md">topic.md</a>
<a href="user.md">user.md</a>
</body></html>
		`;
		it('good test', () => {
			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					response._setSuccessfulContent(good_contents, 'html/html');
					resolve(response);
				});
			});

			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.scanDirectory('/tests/').then(more_directories => {
				expect(collection.files).toHaveLength(2);
				expect(collection.files[0].url).toEqual('/tests/topic.md');
				expect(collection.files[1].url).toEqual('/tests/user.md');
				expect(more_directories).toHaveLength(1);
				expect(more_directories[0]).toEqual('/tests/subtopics/');
			});
		});
	});
	describe('loadFiles', () => {
		// @todo
	});
	describe('resetFilters', () => {
		// @todo
	});
	describe('filterSort', () => {
		it ('basic sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = [
				new File('/tests/test1.md', 'tests', 'test', new Config()),
				new File('/tests/test2.md', 'tests', 'test', new Config())
			];
			collection.files[0].title = 'Zulu';
			collection.files[1].title = 'Alpha';

			collection.resetFilters();
			collection.filterSort('title');

			expect(collection['tests'][0].title).toEqual('Alpha');
			expect(collection['tests'][1].title).toEqual('Zulu');
		});
		it ('reverse basic sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = [
				new File('/tests/test1.md', 'tests', 'test', new Config()),
				new File('/tests/test2.md', 'tests', 'test', new Config())
			];
			collection.files[0].title = 'Alpha';
			collection.files[1].title = 'Zulu';

			collection.resetFilters();
			collection.filterSort('title-r');

			expect(collection['tests'][0].title).toEqual('Zulu');
			expect(collection['tests'][1].title).toEqual('Alpha');
		});
		it ('feature #2 sticky sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = [
				new File('/tests/test1.md', 'tests', 'test', new Config()),
				new File('/tests/test2.md', 'tests', 'test', new Config()),
				new File('/tests/test3.md', 'tests', 'test', new Config()),
				new File('/tests/test4.md', 'tests', 'test', new Config()),
			];
			collection.files[0].title = 'Zulu';
			collection.files[1].title = 'Beta';
			collection.files[2].title = 'Charlie';
			collection.files[2].sticky = true;
			collection.files[3].title = 'Alpha';

			collection.resetFilters();
			collection.filterSort('sticky-r, title');

			expect(collection['tests'][0].title).toEqual('Charlie');
			expect(collection['tests'][1].title).toEqual('Alpha');
			expect(collection['tests'][2].title).toEqual('Beta');
			expect(collection['tests'][3].title).toEqual('Zulu');
		});
		/**
		 * Sort results by a given parameter
		 *
		 * If a function is requested, that is used to sort the results.
		 * If a string is requested, only specific keywords are supported.  Use -r to inverse results.
		 * If NULL is requested, the default sort for this collection type is used.
		 *
		 * @param {object|string|null} [param=null] A function, string, or empty value to sort by
		 */
	});
	describe('filterSearch', () => {
		// @todo
	});
	describe('filterAttributeSearch', () => {
		// @todo
	});
	describe('filterTag', () => {
		// @todo
	});
	describe('filterPermalink', () => {
		// @todo
	});
	describe('getTags', () => {
		// @todo
	});
	describe('getFileByPermalink', () => {
		// @todo
	});
	describe('render', () => {
		// @todo
	});
});
