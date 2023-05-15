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
import File from '../src/file';
import { Config } from '../src/config';
import {FakeResponse} from './fakeresponse';
import CMSError from '../src/cmserror';
import {setSystemContainer} from '../src/templater';



describe('File', () => {
  // Define common file contents that can be re-used

  const generic_contents = `---
title: Testing Bug Features
seotitle: Google Friendly Title
excerpt: This is a generic test
date: 2023-03-14
author: Alice
rating: 4.5
banner: https://www.http.cat/200.jpg
image: Success Cat | https://www.http.cat/200.jpg
tags: Test, Document
falsy: false
truth: true
iamempty: 
---

# Test Page

This is test content about Zebras`;

  const nodate_contents = `---
title: Testing Bug Features
seotitle: Google Friendly Title
excerpt: This is a generic test
author: Alice
banner: https://www.http.cat/200.jpg
image: Success Cat | https://www.http.cat/200.jpg
tags: Test, Document
---

# Test Page

This is test content about Zebras`;

  describe('loadContent', () => {
    it('load content', () => {
      fetch = jest.fn(() => {
        return new Promise(resolve => {
          let response = new FakeResponse();

          response._setSuccessfulContent(
            nodate_contents,
            'application/markdown',
            {'Last-Modified': 'Sun, 07 May 2023 19:03:08 GMT'}
          );

          resolve(response);
        });
      });

      let f = new File('test.md', 'test', 'test', new Config());
      f.loadContent().then(() => {
        expect(f.title).toEqual('Testing Bug Features');
        expect(f.seotitle).toEqual('Google Friendly Title');
        expect(f.excerpt).toEqual('This is a generic test');
        expect(f.author).toEqual('Alice');
        expect(f.banner).toEqual({label: '200.jpg', url: 'https://www.http.cat/200.jpg'});
        expect(f.image).toEqual({label: 'Success Cat', url: 'https://www.http.cat/200.jpg'});
        expect(f.tags).toEqual(['Test', 'Document']);
        expect(f.url).toEqual('test.md');
        expect(f.date).toEqual('May 7, 2023');
        expect(f.datetime).toBeInstanceOf(Date);
        expect(f.datetime.getFullYear()).toEqual(2023);
        expect(f.datetime.getMonth()).toEqual(4);
        expect(f.datetime.getDate()).toEqual(7);
      });
    });
    it('load content 404 not found', async function(){
      fetch = jest.fn(() => {
        return new Promise(resolve => {
          let response = new FakeResponse();
          response._setErrorNotFound();
          resolve(response);
        });
      });

      let f = new File('test.md', 'test', 'test', new Config());
      console.warn = jest.fn(() => true );
      await expect(f.loadContent()).rejects.toBeInstanceOf(CMSError);
    });
    it('load content network error', async function(){
      fetch = jest.fn(() => {
        return new Promise((resolve, reject) => {
          reject('Network error');
        });
      });

      let f = new File('test.md', 'test', 'test', new Config());
      console.warn = jest.fn(() => true );
      await expect(f.loadContent()).rejects.toBeInstanceOf(CMSError);
    });
  });

  describe('parseFrontMatter', () => {
    it('basic attributes', () => {
      let f = new File('test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseFrontMatter();

      expect(f.title).toEqual('Testing Bug Features');
      expect(f.seotitle).toEqual('Google Friendly Title');
      expect(f.excerpt).toEqual('This is a generic test');
      expect(f.author).toEqual('Alice');
      expect(f.banner).toEqual({label: '200.jpg', url: 'https://www.http.cat/200.jpg'});
      expect(f.image).toEqual({label: 'Success Cat', url: 'https://www.http.cat/200.jpg'});
      expect(f.tags).toEqual(['Test', 'Document']);
      expect(f.url).toEqual('test.md');
      expect(f.date).toEqual('2023-03-14');
      expect(f.falsy).toEqual(false);
      expect(f.truth).toEqual(true);
      expect(f.iamempty).toBeUndefined();
    });
    it('protected attributes', () => {
      let f = new File('test.md', 'test', 'test', new Config());
      f.content = `---
title: Testing SEO Features
permalink: https://test.tld
---`;
      console.warn = jest.fn(() => true);
      f.parseFrontMatter();
      expect(console.warn.mock.calls).toHaveLength(1);
    });
    it('relative file', () => {
      let f = new File('test.md', 'test', 'test', new Config());
      f.content = `---
title: Testing SEO Features
image: Local Cat | images/200.jpg
---`;
      f.parseFrontMatter();
      expect(f.image).toEqual({label: 'Local Cat', url: 'images/200.jpg'});
    });
    it('relative file with directory', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = `---
title: Testing SEO Features
image: Local Cat | images/200.jpg
---`;
      f.parseFrontMatter();
      expect(f.image).toEqual({label: 'Local Cat', url: '/posts/topic/images/200.jpg'});
    });
    it('bad key case', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = `---
Title: Testing Bug Features
Author: Bob
THING: Yup, this is a thing! 
---`;
      f.parseFrontMatter();

      expect(f.Title).toBeUndefined();
      expect(f.Author).toBeUndefined();
      expect(f.THING).toBeUndefined();
      expect(f.title).toEqual('Testing Bug Features');
      expect(f.author).toEqual('Bob');
      expect(f.thing).toEqual('Yup, this is a thing!');
    });

    /**
     * Check to ensure that function cannot be overridden from incoming keys
     */
    it('function overrides', () => {
      console.warn = jest.fn(() => true );

      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = `---
render: false
title: Sneaky exploit attempt
---`;
      f.parseFrontMatter();
      expect(f.render).toBeInstanceOf(Object);
      expect(typeof f.render).toBe('function');
    });
  });

  describe('parseFilename', () => {
    it('/pages/content/about.md', () => {
      let f = new File('/pages/content/about.md', 'test', 'test', new Config());
      f.parseFilename();
      expect(f.name).toEqual('about');
    });
  });

  describe('parsePermalink', () => {
    it('/pages/content/about.md', () => {
      let f = new File('/pages/content/about.md', 'test', 'test', new Config());
      f.parsePermalink();
      expect(f.permalink).toEqual('/pages/content/about.html');
    });
  });

  describe('parseDate', () => {
    it('2023-03-14 frontmatter', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = `---
title: Testing Bug Features
date: 2023-03-14
---`;
      f.parseFrontMatter();
      assert.equal(f.date, '2023-03-14');
      f.parseDate();
      assert.equal(f.date, 'Mar 14, 2023');
      expect(f.datetime).toBeInstanceOf(Date);
      assert.equal(f.datetime.getFullYear(), 2023);
      assert.equal(f.datetime.getMonth(), 2);
      assert.equal(f.datetime.getDate(), 14);
    });
    it('2023-03-14 url', () => {
      let f = new File('/posts/topic/2023-03-14-test.md', 'test', 'test', new Config());
      f.content = `---
title: Testing Bug Features
---`;
      f.parseFrontMatter();
      expect(f.url).toContain('2023-03-14');
      expect(f.date).toBeNull();
      f.parseDate();
      expect(f.date).toEqual('Mar 14, 2023');
      expect(f.datetime).toBeInstanceOf(Date);
      expect(f.datetime.getFullYear()).toEqual(2023);
      expect(f.datetime.getMonth()).toEqual(2);
      expect(f.datetime.getDate()).toEqual(14);
    });
    it('2023/03/14 url', () => {
      let f = new File('/posts/topic/2023/03/14/test.md', 'test', 'test', new Config());
      f.content = `---
title: Testing Bug Features
---`;
      f.parseFrontMatter();
      expect(f.url).toContain('2023/03/14');
      expect(f.date).toBeNull();
      f.parseDate();
      expect(f.date).toEqual('Mar 14, 2023');
      expect(f.datetime).toBeInstanceOf(Date);
      expect(f.datetime.getFullYear()).toEqual(2023);
      expect(f.datetime.getMonth()).toEqual(2);
      expect(f.datetime.getDate()).toEqual(14);
    });
    it('last-modified header', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = `---
title: Testing Bug Features
---`;
      // Spoof this as it would be set from the HTTP header
      f.datetime = 'Sun, 07 May 2023 19:03:08 GMT';
      f.parseFrontMatter();
      expect(f.date).toBeNull();
      f.parseDate();
      expect(f.date).toEqual('May 7, 2023');
      expect(f.datetime).toBeInstanceOf(Date);
      expect(f.datetime.getFullYear()).toEqual(2023);
      expect(f.datetime.getMonth()).toEqual(4);
      expect(f.datetime.getDate()).toEqual(7);
    });
  });

  describe('parseBody', () => {
    it('marked', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      expect(f.bodyLoaded).toEqual(false);
      expect(f.body).toBeNull();
      f.parseBody();
      expect(f.bodyLoaded).toEqual(true);
      expect(f.body).toEqual('<h1 id="test-page">Test Page</h1>\n<p>This is test content about Zebras</p>\n');
    });
    it('embedded', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.config.markdownEngine = null;
      f.content = generic_contents;
      expect(f.bodyLoaded).toEqual(false);
      expect(f.body).toBeNull();
      f.parseBody();
      expect(f.bodyLoaded).toEqual(true);
      expect(f.body).toEqual('<h1>Test Page</h1>\n\n<p>This is test content about Zebras</p>');
    });
    /**
     * Test if the Markdown page has no FrontMatter content, it should still render
     */
    it('no frontmatter', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = `# Test Page

This is test content about Zebras`;
      f.parseBody();
      expect(f.bodyLoaded).toEqual(true);
      expect(f.body).toEqual('<h1 id="test-page">Test Page</h1>\n<p>This is test content about Zebras</p>\n');
    });
    it('no content', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = '';
      f.parseBody();
      expect(f.bodyLoaded).toEqual(true);
      expect(f.body).toEqual('');
    });
  });

  describe('parseContent', () => {
    it('standard', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      expect(f.title).toBeNull();
      expect(f.date).toBeNull();
      expect(f.author).toBeNull();
      expect(f.name).toBeNull();
      expect(f.permalink).toBeNull();
      f.parseContent();
      expect(f.title).toEqual('Testing Bug Features');
      expect(f.seotitle).toEqual('Google Friendly Title');
      expect(f.excerpt).toEqual('This is a generic test');
      expect(f.author).toEqual('Alice');
      expect(f.banner).toEqual({label: '200.jpg', url: 'https://www.http.cat/200.jpg'});
      expect(f.image).toEqual({label: 'Success Cat', url: 'https://www.http.cat/200.jpg'});
      expect(f.tags).toEqual(['Test', 'Document']);
      expect(f.falsy).toEqual(false);
      expect(f.truth).toEqual(true);
      expect(f.iamempty).toBeUndefined();
      expect(f.permalink).toEqual('/posts/topic/test.html');
      expect(f.url).toEqual('/posts/topic/test.md');
      expect(f.date).toEqual('Mar 14, 2023');
      expect(f.datetime).toBeInstanceOf(Date);
      expect(f.datetime.getFullYear()).toEqual(2023);
      expect(f.datetime.getMonth()).toEqual(2);
      expect(f.datetime.getDate()).toEqual(14);
    });
  });

  describe('matchesSearch', () => {
    it('standard', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      expect(f.matchesSearch('zebras test alice')).toEqual(true);
      expect(f.matchesSearch('zebras stampede alice')).toEqual(false);
    });
  });

  describe('matchesAttributeSearch', () => {
    it('comparisons', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      expect(f.matchesAttributeSearch({author: 'alice'})).toEqual(true);
      expect(f.matchesAttributeSearch({author: 'bob'})).toEqual(false);
      expect(f.matchesAttributeSearch({title: '~ .*Bug.*'})).toEqual(true);
      expect(f.matchesAttributeSearch({date: '> 2020-02-02'})).toEqual(true);
      expect(f.matchesAttributeSearch({rating: '>= 1'})).toEqual(true);
      expect(f.matchesAttributeSearch({rating: '< 5'})).toEqual(true);
      expect(f.matchesAttributeSearch({datetime: '< 2030-04-05'})).toEqual(true);
      expect(f.matchesAttributeSearch({rating: '<= 4.5'})).toEqual(true);
    });
    it('tags basic', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      expect(f.matchesAttributeSearch({tags: 'document'})).toEqual(true);
      expect(f.matchesAttributeSearch({tags: 'popcorn'})).toEqual(false);
      expect(f.matchesAttributeSearch({tags: ['document', 'draft']})).toEqual(true);
      expect(f.matchesAttributeSearch({tags: ['hot', 'buttered', 'popcorn']})).toEqual(false);
    });
    it('or mode', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      expect(f.matchesAttributeSearch({author: 'Richard', tags: ['Pineapple', 'Pizza'], rating: '> 2.0'}, 'OR')).toEqual(true);
      expect(f.matchesAttributeSearch({author: 'Richard', tags: ['Pineapple', 'Pizza'], rating: '> 5.0'}, 'OR')).toEqual(false);
    });
    it('and mode', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      expect(f.matchesAttributeSearch({author: 'Alice', tags: ['Document', 'Pizza'], rating: '> 2.0'})).toEqual(true);
      expect(f.matchesAttributeSearch({author: 'Alice', tags: ['Pineapple', 'Pizza'], rating: '> 2.0'})).toEqual(false);
    });
    it('null searches', () => {
      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      expect(f.matchesAttributeSearch({author: null})).toEqual(false);
      expect(f.matchesAttributeSearch({idonotexist: 'bob'})).toEqual(false);
    });
  });

  describe('render', () => {
    let area = {};
    global.document = {};

    it('seotitle', () => {
      setSystemContainer(area);

      fetch = jest.fn(() => {
        return new Promise(resolve => {
          let response = new FakeResponse();
          response._setSuccessfulContent(
            '<html><body><h1><%= data.title %></h1></body></html>',
            'text/html'
          );
          resolve(response);
        });
      });

      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      f.render().then(() => {
        expect(global.document.title).toEqual('Google Friendly Title');
        expect(area.innerHTML).toEqual('<html><body><h1>Testing Bug Features</h1></body></html>');
      });
    });
    it('title', () => {
      setSystemContainer(area);

      fetch = jest.fn(() => {
        return new Promise(resolve => {
          let response = new FakeResponse();
          response._setSuccessfulContent(
            '<html><body><h1><%= data.title %></h1></body></html>',
            'text/html'
          );
          resolve(response);
        });
      });

      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      f.seotitle = null;
      f.render().then(() => {
        expect(global.document.title).toEqual('Testing Bug Features');
        expect(area.innerHTML).toEqual('<html><body><h1>Testing Bug Features</h1></body></html>');
      });
    });
    it('no title', () => {
      setSystemContainer(area);

      fetch = jest.fn(() => {
        return new Promise(resolve => {
          let response = new FakeResponse();
          response._setSuccessfulContent(
            '<html><body><h1><%= data.title %></h1></body></html>',
            'text/html'
          );
          resolve(response);
        });
      });

      let f = new File('/posts/topic/test.md', 'test', 'test', new Config());
      f.content = generic_contents;
      f.parseContent();
      f.seotitle = null;
      f.title = '';
      f.render().then(() => {
        expect(global.document.title).toEqual('Page');
        expect(area.innerHTML).toEqual('<html><body><h1></h1></body></html>');
      });
    });
  });
});
