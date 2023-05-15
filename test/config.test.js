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
import {Config, ConfigType} from '../src/config';

describe('Config', () => {
  describe('load', () => {
    it('basic', () => {
      let c,
        params = {
          banana: 'BANANA',
          webpath: '/test/',
          types: [
            {
              name: 'test',
              layout: {
                list: 'test-list',
                single: 'test-single',
                sort: 'key',
                title: 'Tests'
              }
            }
          ]
        };

      c = new Config(params);
      expect(c.banana).toEqual('BANANA');
      expect(c.webpath).toEqual('/test/');
      expect(c.types).toHaveLength(1);
      expect(c.types[0]).toBeInstanceOf(ConfigType);
      expect(c.types[0].name).toEqual('test');
      expect(c.types[0].layout).toBeInstanceOf(Object);
      expect(c.types[0].layout.list).toEqual('test-list');
      expect(c.types[0].layout.single).toEqual('test-single');
      expect(c.types[0].layout.sort).toEqual('key');
      expect(c.types[0].layout.title).toEqual('Tests');
    });
  });
});