import { describe, expect, it } from '@jest/globals';
import {
  buildPendingActionCountByDelivery,
  createPendingAction,
  discardBlockedActions,
  markQueuedActionConflicted,
  markQueuedActionNetworkFailure,
  patchDeliveryForOfflineAction,
} from './offlineQueue';
import type { DriverDeliveryDto, PendingAction } from '../types/api';

describe('offlineQueue helpers', () => {
  it('counts queued actions by delivery', () => {
    const actions: PendingAction[] = [
      { ...createPendingAction(1, 'PICKUP'), state: 'queued' },
      { ...createPendingAction(1, 'START'), state: 'queued' },
      { ...createPendingAction(2, 'FAIL'), state: 'failed' },
    ];

    expect(buildPendingActionCountByDelivery(actions)).toEqual({ 1: 2, 2: 1 });
  });

  it('marks queued actions as failed after max retries', () => {
    const failed = markQueuedActionNetworkFailure(
      {
        ...createPendingAction(3, 'COMPLETE'),
        retryCount: 4,
      },
      'Network down'
    );

    expect(failed.retryCount).toBe(5);
    expect(failed.state).toBe('failed');
    expect(failed.lastError).toBe('Network down');
  });

  it('marks queued actions as conflicted on server-state mismatch', () => {
    const conflicted = markQueuedActionConflicted(createPendingAction(4, 'FAIL'), 'Conflict');
    expect(conflicted.state).toBe('conflicted');
    expect(conflicted.lastError).toBe('Conflict');
  });

  it('discards only blocked actions and keeps queued ones', () => {
    const actions: PendingAction[] = [
      { ...createPendingAction(1, 'PICKUP'), state: 'queued' },
      { ...createPendingAction(2, 'START'), state: 'failed' },
      { ...createPendingAction(3, 'FAIL'), state: 'conflicted' },
    ];

    expect(discardBlockedActions(actions)).toHaveLength(1);
    expect(discardBlockedActions(actions)[0].deliveryId).toBe(1);
  });

  it('patches a delivery locally for offline fail actions', () => {
    const delivery: DriverDeliveryDto = {
      id: 9,
      pickupAddress: 'A',
      deliveryAddress: 'B',
      description: 'Initiale',
      status: 'IN_TRANSIT',
      createdAt: '2026-07-15T10:00:00',
      updatedAt: null,
    };

    const patched = patchDeliveryForOfflineAction(delivery, 'FAIL', { reason: 'Client absent' });

    expect(patched.status).toBe('CANCELLED');
    expect(patched.description).toContain('ECHEC: Client absent');
  });
});