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

import assert from 'assert';
import {describe, expect, it, jest, test} from '@jest/globals';
import {basename, dirname, getDatetime, pathJoin} from "../src/utils.js";

describe('utils', function() {
  describe('#pathJoin', function() {
    it('/posts', function() {
      assert.equal(pathJoin('/', 'posts'), '/posts');
    });
    it('/posts/thing.html', function() {
      assert.equal(pathJoin('/', 'posts', 'thing.html'), '/posts/thing.html');
    });
    it('//posts/thing.html', function() {
      assert.equal(pathJoin('/', '/posts/', 'thing.html'), '/posts/thing.html');
    });
    it('//posts/(empty)/thing.html', function() {
      assert.equal(pathJoin('/', '/posts/', '', 'thing.html'), '/posts/thing.html');
    });
    it('//posts/(NULL)/thing.html', function() {
      assert.equal(pathJoin('/', '/posts/', null, 'thing.html'), '/posts/thing.html');
    });
  });

  describe('#getDatetime', function() {
    it('2021-01-01', function() {
      let d = getDatetime('2021-01-01');
      assert.equal(d.getFullYear(), 2021, 'Year check');
      assert.equal(d.getMonth(), 0, 'Month check');
      assert.equal(d.getDate(), 1, 'Date check');
    });
    it('2023/05/10', function() {
      let d = getDatetime('2023/05/10');
      assert.equal(d.getFullYear(), 2023, 'Year check');
      assert.equal(d.getMonth(), 4, 'Month check');
      assert.equal(d.getDate(), 10, 'Date check');
    });
    it('3/14/23', function() {
      let d = getDatetime('3/14/23');
      assert.equal(d.getFullYear(), 2023, 'Year check');
      assert.equal(d.getMonth(), 2, 'Month check');
      assert.equal(d.getDate(), 14, 'Date check');
    });
  });

  describe('#dirname', function() {
    it('/posts/topic/thing.html', function() {
      assert.equal(dirname('/posts/topic/thing.html'), '/posts/topic/');
    });
    it('/thing.html', function() {
      assert.equal(dirname('/thing.html'), '/');
    });
    it('thing.html', function() {
      assert.equal(dirname('thing.html'), '');
    });
  });

  describe('#basename', function() {
    it('basic.html', function() {
      assert.equal(basename('basic.html'), 'basic.html');
    });
    it('basic.html no extension', function() {
      assert.equal(basename('basic.html', true), 'basic');
    });
    it('/pages/content/basic.html', function() {
      assert.equal(basename('/pages/content/basic.html'), 'basic.html');
    });
    it('/pages/content/basic.html no ext', function() {
      assert.equal(basename('/pages/content/basic.html', true), 'basic');
    });
    it('/pages/content/basic', function() {
      assert.equal(basename('/pages/content/basic'), 'basic');
    });
    it('/pages/content/basic no ext', function() {
      assert.equal(basename('/pages/content/basic', true), 'basic');
    });
  });
});

