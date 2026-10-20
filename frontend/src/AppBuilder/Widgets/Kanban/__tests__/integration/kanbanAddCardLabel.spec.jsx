import { screen } from '@testing-library/react';
import { createWidgetHarness, binding } from '@/AppBuilder/Widgets/__tests__/integration/widgetHarness';

const columns = binding("{{[{ id: '1', title: 'to do' }]}}");
const cards = binding("{{[{ id: 'c1', title: 'Title 1', description: 'Description 1', columnId: '1' }]}}");

const kanban = (properties = {}) =>
  createWidgetHarness({
    componentType: 'Kanban',
    handle: 'kanban1',
    id: 'k1',
    // dnd: cards and the card details modal render through AppCanvas/Container
    capabilities: { dnd: true },
    defaultProperties: {
      columnData: columns,
      cardData: cards,
      enableAddCard: binding('{{true}}'),
      ...properties,
    },
  });

describe('Kanban add card button label', () => {
  describe('custom label', () => {
    const widget = kanban({ addCardLabel: binding('+ New task') });
    beforeEach(widget.setup);
    afterEach(widget.teardown);

    test('shows the configured label', async () => {
      widget.render();

      expect(await screen.findByText('+ New task')).toBeInTheDocument();
    });
  });

  describe('label bound to an expression', () => {
    const widget = kanban({ addCardLabel: binding("{{'+ Add ' + 'story'}}") });
    beforeEach(widget.setup);
    afterEach(widget.teardown);

    test('shows the resolved label', async () => {
      widget.render();

      expect(await screen.findByText('+ Add story')).toBeInTheDocument();
    });
  });

  describe('apps saved before the property existed', () => {
    const widget = kanban();
    beforeEach(widget.setup);
    afterEach(widget.teardown);

    test('fall back to the original label', async () => {
      widget.render();

      expect(await screen.findByText('+ Add Card')).toBeInTheDocument();
    });
  });
});
