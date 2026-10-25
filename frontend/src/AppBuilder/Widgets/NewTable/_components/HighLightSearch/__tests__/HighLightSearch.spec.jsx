import React from 'react';
import { render } from '@testing-library/react';
import { HighLightSearch } from '../HighLightSearch';

describe('HighLightSearch', () => {
  it('highlights a search term containing regex metacharacters', () => {
    const { container } = render(<HighLightSearch text="price (USD)" searchTerm="(usd" />);
    expect(container.querySelector('mark').textContent).toBe('(USD');
  });

  it('matches a dot literally', () => {
    const { container } = render(<HighLightSearch text="a.c abc" searchTerm="a.c" />);
    const marks = [...container.querySelectorAll('mark')].map((m) => m.textContent);
    expect(marks).toEqual(['a.c']);
  });
});
