import { screen, waitFor, act } from '@testing-library/react';
import { createWidgetHarness, binding, store } from '@/AppBuilder/Widgets/__tests__/integration/widgetHarness';

const ID = 'tb1';

const tabItem = (id, title) => ({
  id,
  title,
  icon: { value: 'IconHome2' },
  iconVisibility: { value: false },
  loading: { value: false },
  disable: { value: false },
  visible: { value: true },
});

const widget = createWidgetHarness({
  componentType: 'Tabs',
  handle: 'tabs1',
  id: ID,
  widgetHeight: 300,
  // dnd: each tab body renders through AppCanvas/Container
  capabilities: { dnd: true },
  defaultProperties: {
    useDynamicOptions: binding('{{false}}'),
    tabItems: { value: [tabItem('t0', 'Home'), tabItem('t1', 'Orders'), tabItem('t2', 'Settings')] },
    defaultTab: binding('t0'),
  },
});

const exposed = () => store().getExposedValueOfComponent(ID, 'canvas');

describe('Tabs previousTab', () => {
  beforeEach(widget.setup);
  afterEach(widget.teardown);

  test('clicking a tab exposes the tab that was left', async () => {
    widget.render();

    await widget.session.user.click(await screen.findByText('Orders'));

    await waitFor(() => expect(exposed().currentTab).toBe('t1'));
    expect(exposed().previousTab).toBe('t0');
    expect(exposed().previousTabTitle).toBe('Home');
  });

  test('setTab exposes the tab that was left', async () => {
    widget.render();
    await screen.findByText('Settings');

    await act(() => exposed().setTab('t2'));

    await waitFor(() => expect(exposed().currentTab).toBe('t2'));
    expect(exposed().previousTab).toBe('t0');
    expect(exposed().previousTabTitle).toBe('Home');
  });
});
