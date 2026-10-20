import React from 'react';
import { render } from '@testing-library/react';
import useStore from '@/AppBuilder/_stores/store';
import { seedApp, componentDefinition } from '@/test/app-builder';
import { tableConfig } from '@/AppBuilder/WidgetManager/widgets/table';
import { Table } from '../../Table';

const state = () => useStore.getState();

function tableWithColumn(isEditable) {
  return {
    id: 't1',
    component: {
      ...tableConfig,
      component: 'Table',
      name: 'table1',
      definition: {
        properties: {
          columns: { value: [{ id: 'col-1', name: 'email', key: 'email', columnType: 'string', isEditable }] },
          useDynamicColumn: { value: '{{false}}' },
        },
        styles: {},
        others: {},
        events: [],
      },
    },
  };
}

function renderEditIcon(isEditable) {
  const { container } = render(
    <Table
      component={tableWithColumn(isEditable)}
      componentMeta={tableConfig}
      paramUpdated={() => {}}
      dataQueries={[]}
      components={{}}
      currentState={{}}
      darkMode={false}
      eventsChanged={() => {}}
      apps={[]}
      pages={[]}
      layoutPropertyChanged={() => {}}
    />
  );
  const column = container.querySelector('[data-cy="column-email"]');
  expect(column).not.toBeNull();
  // The edit icon sits in the column's text cell; the drag handle and menu icons live outside it
  return column.querySelector('.text-truncate svg');
}

beforeEach(() => {
  seedApp({ toggle: componentDefinition('toggle', 'toggle1', 'ToggleSwitchV2') });
});

describe('Table inspector column list: editable icon', () => {
  test('shows the icon when isEditable is bound to another component that resolves to true', () => {
    state().setExposedValue('toggle', 'value', true);

    expect(renderEditIcon('{{components.toggle1.value}}')).not.toBeNull();
  });

  test('hides the icon when the bound value resolves to false', () => {
    state().setExposedValue('toggle', 'value', false);

    expect(renderEditIcon('{{components.toggle1.value}}')).toBeNull();
  });

  test('shows the icon for a literal {{true}}', () => {
    expect(renderEditIcon('{{true}}')).not.toBeNull();
  });
});
