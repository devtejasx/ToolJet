import pdfPageAtScrollPosition from '../pdfPageAtScrollPosition';

// Three 1000px pages stacked in a 400px-tall viewport, i.e. pages taller than the
// viewport, where a 70% visibility threshold could never be met.
const pages = [{ offsetTop: 0 }, { offsetTop: 1000 }, { offsetTop: 2000 }];

describe('pdfPageAtScrollPosition', () => {
  it('returns the first page at the top of the document', () => {
    expect(pdfPageAtScrollPosition(pages, 0, 400)).toBe(1);
  });

  it('follows the page under the middle of the viewport while scrolling', () => {
    expect(pdfPageAtScrollPosition(pages, 700, 400)).toBe(1);
    expect(pdfPageAtScrollPosition(pages, 900, 400)).toBe(2);
    expect(pdfPageAtScrollPosition(pages, 2100, 400)).toBe(3);
  });

  it('ignores pages that have not rendered yet', () => {
    expect(pdfPageAtScrollPosition([{ offsetTop: 0 }, null, undefined], 1500, 400)).toBe(1);
  });
});
