import React from 'react';
import { render, screen } from '@testing-library/react';

// The CodeHinter editor is heavy and irrelevant here; show the value it is given.
jest.mock('@/AppBuilder/CodeEditor', () => ({
  __esModule: true,
  default: ({ initialValue }) => <input readOnly aria-label="parameter value" value={initialValue ?? ''} />,
}));

import useStore from '@/AppBuilder/_stores/store';
import { seedApp } from '@/test/app-builder';
import { createAppBuilderControls } from '@/test/app-builder/controls';
import RunjsParameters from '../../RunjsParamters';

const query = {
  id: 'q1',
  name: 'getOrders',
  options: {
    parameters: [
      { name: 'status', defaultValue: 'open' },
      // added to the query after the event handler was configured
      { name: 'limit', defaultValue: '20' },
    ],
  },
};

const values = () => screen.getAllByLabelText('parameter value').map((input) => input.value);

// OverflowTooltip (the parameter name) needs ResizeObserver, which jsdom lacks
const controls = createAppBuilderControls();

afterEach(() => controls.restore());

beforeEach(() => {
  controls.observers.install();
  seedApp({});
  useStore.getState().dataQuery.setQueries([query]);
});

describe('Run Query event parameters', () => {
  test('a parameter added after the event was set up shows the query default', () => {
    render(
      <RunjsParameters
        event={{ queryId: 'q1', parameters: { status: 'closed' } }}
        index={0}
        handlerChanged={() => {}}
      />
    );

    expect(values()).toEqual(['closed', '20']);
  });

  test('a value saved in the event wins over the default, even when empty', () => {
    render(
      <RunjsParameters
        event={{ queryId: 'q1', parameters: { status: '', limit: '5' } }}
        index={0}
        handlerChanged={() => {}}
      />
    );

    expect(values()).toEqual(['', '5']);
  });
});
