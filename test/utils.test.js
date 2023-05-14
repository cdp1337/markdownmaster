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

