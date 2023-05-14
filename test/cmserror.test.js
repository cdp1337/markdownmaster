import {describe, expect, it, jest, test} from '@jest/globals';
import CMSError from '../src/cmserror';

describe('CMSError', () => {
  describe('toString', () => {
    it('404', () => {
      let e = new CMSError(404, 'Not Found');
      expect(e.toString()).toEqual('[404] Not Found');
    });
  });
});