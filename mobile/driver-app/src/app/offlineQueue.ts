import type { DriverDeliveryDto, PendingAction, PendingActionType } from '../types/api';

export function createPendingAction(
  deliveryId: number,
  actionType: PendingActionType,
  payload?: PendingAction['payload'],
  lastError?: string
): PendingAction {
  return {
    actionId: `${actionType}-${deliveryId}-${Date.now()}`,
    deliveryId,
    actionType,
    state: 'queued',
    payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
    lastError,
  };
}

export function buildPendingActionCountByDelivery(actions: PendingAction[]) {
  return actions.reduce<Record<number, number>>((accumulator, action) => {
    accumulator[action.deliveryId] = (accumulator[action.deliveryId] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function markQueuedActionNetworkFailure(action: PendingAction, message: string) {
  const retryCount = action.retryCount + 1;

  return {
    ...action,
    retryCount,
    lastError: message,
    state: retryCount >= 5 ? 'failed' : 'queued',
  } satisfies PendingAction;
}

export function markQueuedActionConflicted(action: PendingAction, message: string) {
  return {
    ...action,
    state: 'conflicted',
    lastError: message,
  } satisfies PendingAction;
}

export function discardBlockedActions(actions: PendingAction[]) {
  return actions.filter((action) => action.state === 'queued');
}

export function patchDeliveryForOfflineAction(
  delivery: DriverDeliveryDto,
  actionType: PendingActionType,
  payload?: PendingAction['payload']
) {
  const updatedAt = new Date().toISOString();

  if (actionType === 'PICKUP') {
    return { ...delivery, status: 'PICKED_UP', updatedAt } satisfies DriverDeliveryDto;
  }

  if (actionType === 'START') {
    return { ...delivery, status: 'IN_TRANSIT', updatedAt } satisfies DriverDeliveryDto;
  }

  if (actionType === 'COMPLETE') {
    return { ...delivery, status: 'DELIVERED', updatedAt } satisfies DriverDeliveryDto;
  }

  const description = payload?.reason
    ? `${delivery.description ?? ''}${delivery.description ? ' | ' : ''}ECHEC: ${payload.reason}`
    : delivery.description;

  return {
    ...delivery,
    status: 'CANCELLED',
    updatedAt,
    description,
  } satisfies DriverDeliveryDto;
}