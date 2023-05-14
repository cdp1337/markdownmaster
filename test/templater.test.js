import {describe, expect, it, jest, test} from '@jest/globals';
import {FakeResponse} from './fakeresponse';
import {fetchLayout} from '../src/templater';
import CMSError from '../src/cmserror';

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