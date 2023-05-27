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
import {fetchLayout} from '../../src/client/templater';
import CMSError from '../../src/client/cmserror';

describe('templater', () => {
  const good_payload = {key: 'some key', roses: true};
  const good_template = '<html><body><%= data.key %> <% if (data.roses) { %>red<% } %></body>';
  const good_result = '<html><body>some key red</body>';
  const bad_template = '<html><body><%= data.invalid.blah %> <% if (data.roses) { %>red<% } %></body>';

  describe('fetchLayout', () => {
    it('basic fetch', () => {
      fetch = jest.fn(() => {
        return new Promise(resolve => {
          let response = new FakeResponse();
          response._setSuccessfulContent(good_template, 'text/html');
          resolve(response);
        });
      });

      fetchLayout('test', good_payload).then(html => {
        expect(html).toEqual(good_result);
      });
    });
  });
  it('bad property', async () => {
    fetch = jest.fn(() => {
      return new Promise(resolve => {
        let response = new FakeResponse();
        response._setSuccessfulContent(bad_template, 'text/html');
        resolve(response);
      });
    });

    console.error = jest.fn(() => true);
    await expect(fetchLayout('test', good_payload)).rejects.toBeInstanceOf(CMSError);
  });
  it('template not found', async () => {
    fetch = jest.fn(() => {
      return new Promise(resolve => {
        let response = new FakeResponse();
        response._setErrorNotFound();
        resolve(response);
      });
    });

    console.error = jest.fn(() => true);
    await expect(fetchLayout('test', good_payload)).rejects.toBeInstanceOf(CMSError);
  });
});