'use strict';

const { isEmpty, sanitizeSearchParams, sanitizeSortPairs } = require('../lib/utils.helper');

describe('isEmpty', () => {
  it.each([undefined, null, '', '   ', Number.NaN])('treats %p as empty', (value) => {
    expect(isEmpty(value)).toBe(true);
  });

  it.each([0, 42, '0', '42', '123456789', 'value'])('treats %p as a value', (value) => {
    expect(isEmpty(value)).toBe(false);
  });
});

describe('sanitizers keep numeric entries', () => {
  const blankRow = ['', ''];

  it('keeps a sort pair on a numeric field name', () => {
    const sort = [['2024', 'asc'], blankRow];
    expect(sanitizeSortPairs(sort)).toEqual([['2024', 'asc']]);
  });

  it('keeps a URL parameter whose key and value are numeric', () => {
    const queryOptions = { url_params: [['1', '2'], blankRow] };
    expect(sanitizeSearchParams({}, queryOptions, false)).toEqual([['1', '2']]);
  });
});
