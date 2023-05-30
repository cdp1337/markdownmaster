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
import FileCollection from '../../src/client/filecollection';
import {Config} from '../../src/client/config';
import {JSDOM} from 'jsdom';
import File from '../../src/client/file';
import CMSError from '../../src/client/cmserror';


const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

describe('FileCollection', () => {
	const good_directory_listing_contents = `<html><body>
<a href="../">../</a>
<a href="subtopics/">subtopics/</a>
<a href="img.png">img.png</a>
<a href="topic.md">topic.md</a>
<a href="user.md">user.md</a>
</body></html>
		`;

	const good_files = [
		new File('/tests/test1.md', 'tests', 'test', new Config()),
		new File('/tests/test2.md', 'tests', 'test', new Config()),
		new File('/tests/test3.md', 'tests', 'test', new Config()),
		new File('/tests/test4.md', 'tests', 'test', new Config()),
	];
	good_files[0].title = 'Zulu';
	good_files[0].permalink = '/tests/test1.html';
	good_files[1].title = 'Beta';
	good_files[1].tags = ['Test', 'greek'];
	good_files[1].permalink = '/tests/test2.html';
	good_files[2].title = 'Charlie';
	good_files[2].sticky = true;
	good_files[2].permalink = '/tests/test3.html';
	good_files[3].title = 'Alpha';
	good_files[3].tags = ['Test'];
	good_files[3].permalink = '/tests/test4.html';

	describe('getFileListUrl', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			expect(collection.getFileListUrl()).toEqual('/tests');
		});
	});
	describe('getFileElements', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			let files = collection.getFileElements(good_directory_listing_contents);
			expect(files).toHaveLength(3);
			expect(files[0]).toEqual('subtopics/');
			expect(files[1]).toEqual('topic.md');
			expect(files[2]).toEqual('user.md');
		});
	});
	describe('getFiles', () => {
		it('basic', () => {
			let subtopics = `<html><body>
<a href="../">../</a>
<a href="images/">images/</a>
<a href="topic1.md">topic1.md</a>
<a href="topic2.md">topic2.md</a>
</body></html>
		`
			fetch = jest.fn(url => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					if (url === '/tests/subtopics/') {
						response._setSuccessfulContent(subtopics, 'html/html');
					} else {
						response._setSuccessfulContent(good_directory_listing_contents, 'html/html');
					}

					resolve(response);
				});
			});

			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.getFiles().then(() => {
				expect(collection.files).toHaveLength(4);
				expect(collection.files[0].url).toEqual('/tests/topic.md');
				expect(collection.files[1].url).toEqual('/tests/user.md');
				expect(collection.files[2].url).toEqual('/tests/subtopics/topic1.md');
				expect(collection.files[3].url).toEqual('/tests/subtopics/topic2.md');
			});
		});
	});
	describe('scanDirectory', () => {
		it('good test', () => {
			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					response._setSuccessfulContent(good_directory_listing_contents, 'html/html');
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
			collection.files = good_files;

			collection.resetFilters();
			collection.filterSort('title');

			expect(collection['tests'][0].title).toEqual('Alpha');
			expect(collection['tests'][1].title).toEqual('Beta');
			expect(collection['tests'][2].title).toEqual('Charlie');
			expect(collection['tests'][3].title).toEqual('Zulu');
		});
		it ('reverse basic sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			collection.filterSort('title-r');

			expect(collection['tests'][0].title).toEqual('Zulu');
			expect(collection['tests'][1].title).toEqual('Charlie');
			expect(collection['tests'][2].title).toEqual('Beta');
			expect(collection['tests'][3].title).toEqual('Alpha');
		});
		it ('feature #2 sticky sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			collection.filterSort('sticky-r, title');

			expect(collection['tests'][0].title).toEqual('Charlie');
			expect(collection['tests'][1].title).toEqual('Alpha');
			expect(collection['tests'][2].title).toEqual('Beta');
			expect(collection['tests'][3].title).toEqual('Zulu');
		});
	});
	describe('filterSearch', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			let files = collection.filterSearch('zulu');
			expect(files).toHaveLength(1);
			expect(files[0].title).toEqual('Zulu');
		});
	});
	describe('filterAttributeSearch', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			let files = collection.filterAttributeSearch({title: 'zulu'});
			expect(files).toHaveLength(1);
			expect(files[0].title).toEqual('Zulu');
		});
	});
	describe('filterTag', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			let files = collection.filterTag('greek');
			expect(files).toHaveLength(1);
			expect(files[0].title).toEqual('Beta');
		});
	});
	describe('filterPermalink', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			let files = collection.filterPermalink('/tests/');
			expect(files).toHaveLength(4);

			files = collection.filterPermalink('/tests/test4');
			expect(files).toHaveLength(1);
		});
	});
	describe('getTags', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();

			let tags = collection.getTags();
			expect(tags).toHaveLength(2);
			expect(tags[0]).toEqual({name: 'Test', count: 2, url: '/tests.html?tag=Test', weight: 10});
			expect(tags[1]).toEqual({name: 'greek', count: 1, url: '/tests.html?tag=greek', weight: 5});
		});
	});
	describe('getFileByPermalink', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			let file = collection.getFileByPermalink('/tests/test2.html');
			expect(file.url).toEqual('/tests/test2.md');
		});
		it('not found', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.files = good_files;

			collection.resetFilters();
			expect(() => {
				collection.getFileByPermalink('/tests/test-invalid.html')
			}).toThrow(CMSError);
		});

	});
	describe('render', () => {
		// @todo
	});
});
