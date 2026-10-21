import React from 'react';
import { render, fireEvent } from '@testing-library/react';

// The popover body is a canvas sub-container; its contents do not matter here.
jest.mock('@/AppBuilder/AppCanvas/Container', () => ({ Container: () => <div data-testid="popover-canvas" /> }));

import { CalendarEventPopover } from '../CalendarPopover';

const renderPopover = (popoverClosed) =>
  render(
    <CalendarEventPopover
      id="cal1"
      calendarWidgetId="cal1"
      show
      offset={{}}
      darkMode={false}
      popoverClosed={popoverClosed}
    />
  );

// Stands in for a Modal component placed in the popover: it renders outside the popover, in the canvas
const openModalWithButton = () => {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = '<div class="modal-dialog"><button type="button">Save</button></div>';
  document.body.appendChild(modal);
  return modal;
};

afterEach(() => {
  document.querySelectorAll('.modal').forEach((modal) => modal.remove());
});

describe('CalendarEventPopover outside clicks', () => {
  test('a click inside a modal opened from the popover keeps the popover open', () => {
    const popoverClosed = jest.fn();
    renderPopover(popoverClosed);
    const modal = openModalWithButton();

    fireEvent.click(modal.querySelector('button'));

    expect(popoverClosed).not.toHaveBeenCalled();
  });

  test('a click elsewhere on the page still closes it', () => {
    const popoverClosed = jest.fn();
    renderPopover(popoverClosed);
    const outside = document.createElement('button');
    document.body.appendChild(outside);

    fireEvent.click(outside);

    expect(popoverClosed).toHaveBeenCalled();
    outside.remove();
  });
});
