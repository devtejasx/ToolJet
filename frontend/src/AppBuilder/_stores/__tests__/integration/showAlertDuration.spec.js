// react-hot-toast is an external package adapter; replace it so the calls can be inspected.
jest.mock('react-hot-toast', () => {
  const toast = jest.fn();
  toast.success = jest.fn();
  toast.error = jest.fn();
  return { __esModule: true, default: toast, toast };
});

import toast from 'react-hot-toast';
import useStore from '@/AppBuilder/_stores/store';
import { seedApp } from '@/test/app-builder';

const s = () => useStore.getState();
const showAlert = (event) => s().eventsSlice.executeAction({ actionId: 'show-alert', ...event }, 'edit', {}, 'canvas');

beforeEach(() => {
  seedApp({});
  toast.mockClear();
  toast.success.mockClear();
  toast.error.mockClear();
});

describe('show-alert action duration', () => {
  test('keeps the default timeout when no duration is set', async () => {
    await showAlert({ alertType: 'success', message: 'Saved' });

    expect(toast.success).toHaveBeenCalledWith('Saved', {});
  });

  test('passes the duration in seconds to the toast as milliseconds', async () => {
    await showAlert({ alertType: 'error', message: 'Failed', duration: '{{8}}' });

    expect(toast.error).toHaveBeenCalledWith('Failed', { duration: 8000 });
  });

  test('applies the duration to info and warning alerts too', async () => {
    await showAlert({ alertType: 'info', message: 'Heads up', duration: '5' });
    await showAlert({ alertType: 'warning', message: 'Careful', duration: '2.5' });

    expect(toast).toHaveBeenNthCalledWith(1, 'Heads up', { duration: 5000 });
    expect(toast).toHaveBeenNthCalledWith(2, 'Careful', { duration: 2500, icon: '⚠️' });
  });

  test('ignores a duration that is not a positive number', async () => {
    await showAlert({ alertType: 'success', message: 'Saved', duration: 'soon' });
    await showAlert({ alertType: 'success', message: 'Saved', duration: '0' });

    expect(toast.success).toHaveBeenNthCalledWith(1, 'Saved', {});
    expect(toast.success).toHaveBeenNthCalledWith(2, 'Saved', {});
  });

  test('RunJS actions.showAlert accepts the duration as a third argument', async () => {
    const actions = s().eventsSlice.generateAppActions(undefined, 'edit', false, 'canvas');

    await actions.showAlert('success', 'Report is ready', 10);

    expect(toast.success).toHaveBeenCalledWith('Report is ready', { duration: 10000 });
  });
});
