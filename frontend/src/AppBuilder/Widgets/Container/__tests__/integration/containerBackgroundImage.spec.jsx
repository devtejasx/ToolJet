import { waitFor } from '@testing-library/react';
import { createWidgetHarness, binding } from '@/AppBuilder/Widgets/__tests__/integration/widgetHarness';

const container = (styles = {}) =>
  createWidgetHarness({
    componentType: 'Container',
    handle: 'container1',
    id: 'cn1',
    widgetHeight: 200,
    // dnd: the container body renders through AppCanvas/Container
    capabilities: { dnd: true },
    defaultProperties: { showHeader: binding('{{false}}') },
    defaultStyles: styles,
  });

const containerEl = (rendered) => rendered.container.querySelector('.jet-container');

describe('Container background image', () => {
  describe('with an image URL', () => {
    const widget = container({ backgroundImage: binding('https://example.com/bg.png') });
    beforeEach(widget.setup);
    afterEach(widget.teardown);

    test('shows the image, scaled to cover the container', async () => {
      const rendered = widget.render();

      await waitFor(() =>
        expect(containerEl(rendered).style.backgroundImage).toMatch(/^url\("?https:\/\/example\.com\/bg\.png"?\)$/)
      );
      expect(containerEl(rendered).style.backgroundSize).toBe('cover');
    });
  });

  describe('with an image URL from an expression', () => {
    const widget = container({ backgroundImage: binding("{{'https://example.com/' + 'hero.jpg'}}") });
    beforeEach(widget.setup);
    afterEach(widget.teardown);

    test('resolves it', async () => {
      const rendered = widget.render();

      await waitFor(() =>
        expect(containerEl(rendered).style.backgroundImage).toMatch(/^url\("?https:\/\/example\.com\/hero\.jpg"?\)$/)
      );
    });
  });

  describe('without an image', () => {
    const widget = container();
    beforeEach(widget.setup);
    afterEach(widget.teardown);

    test('keeps only the background colour', async () => {
      const rendered = widget.render();

      await waitFor(() => expect(containerEl(rendered)).not.toBeNull());
      expect(containerEl(rendered).style.backgroundImage).toBe('');
    });
  });
});
