import React from 'react';
import { render, screen } from '@testing-library/react';
import { seedApp } from '@/test/app-builder';
import { StringColumn } from '../_components/DataTypes/adapters/StringColumnAdapter';
import { NumberColumn } from '../_components/DataTypes/adapters/NumberColumnAdapter';
import { TextColumn } from '../_components/DataTypes/adapters/TextColumnAdapter';

// Fails when another cell of the same row says the order is closed
const closedRowRule = "{{rowData.status === 'closed' ? 'Closed orders cannot change' : true}}";
// Uses this cell's own value through rowData
const ownValueRule = "{{rowData.qty > 10 ? 'At most 10' : true}}";

const rowWith = (original) => ({ index: 0, original });
// Validation errors are only shown on editable cells
const commonProps = { id: 't1', isEditable: true, darkMode: false, handleCellValueChange: () => {}, searchText: '' };

beforeEach(() => {
  seedApp({});
});

describe('Table column custom rule can read rowData', () => {
  test('String column', () => {
    render(
      <StringColumn
        {...commonProps}
        cellValue="Desk"
        column={{ key: 'item', name: 'item', customRule: closedRowRule }}
        row={rowWith({ item: 'Desk', status: 'closed' })}
      />
    );

    expect(screen.getByText('Closed orders cannot change')).toBeInTheDocument();
  });

  test('String column passes when the row allows it', () => {
    render(
      <StringColumn
        {...commonProps}
        cellValue="Desk"
        column={{ key: 'item', name: 'item', customRule: closedRowRule }}
        row={rowWith({ item: 'Desk', status: 'open' })}
      />
    );

    expect(screen.queryByText('Closed orders cannot change')).not.toBeInTheDocument();
  });

  test('Number column sees its current value in rowData', () => {
    render(
      <NumberColumn
        {...commonProps}
        cellValue={12}
        column={{ key: 'qty', name: 'qty', customRule: ownValueRule }}
        row={rowWith({ qty: 3 })}
      />
    );

    expect(screen.getByText('At most 10')).toBeInTheDocument();
  });

  test('Text column', () => {
    render(
      <TextColumn
        {...commonProps}
        cellValue="Needs a desk"
        column={{ key: 'notes', name: 'notes', customRule: closedRowRule }}
        cell={{ row: rowWith({ notes: 'Needs a desk', status: 'closed' }) }}
      />
    );

    expect(screen.getByText('Closed orders cannot change')).toBeInTheDocument();
  });
});
