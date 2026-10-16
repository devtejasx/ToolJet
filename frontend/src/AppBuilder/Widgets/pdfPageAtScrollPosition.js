/**
 * Returns the 1-based number of the page that covers the middle of the PDF viewport.
 *
 * Pages are compared by offsetTop against the scroll container, the same offsets the
 * page controls scroll to, so this works for pages taller than the viewport.
 */
export default function pdfPageAtScrollPosition(pages, scrollTop, viewportHeight) {
  const middle = scrollTop + viewportHeight / 2;
  let currentPage = 1;
  pages.forEach((page, index) => {
    if (page && page.offsetTop <= middle) currentPage = index + 1;
  });
  return currentPage;
}
