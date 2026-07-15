import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { DeliveryDetailScreen } from './DeliveryDetailScreen';
import type { DriverDeliveryDto } from '../types/api';

const delivery: DriverDeliveryDto = {
  id: 42,
  pickupAddress: '12 Rue du Depart',
  deliveryAddress: '90 Avenue du Port',
  description: 'Commande fragile',
  status: 'ASSIGNED',
  createdAt: '2026-07-15T10:00:00.000Z',
  updatedAt: '2026-07-15T10:05:00.000Z',
  restaurant: {
    id: 7,
    name: 'Harbor Bowl Kitchen',
    address: '18 Quai des Saveurs',
  },
  customer: {
    id: 9,
    email: 'customer@test.com',
  },
};

describe('DeliveryDetailScreen', () => {
  it('prefills a quick failure reason when a chip is pressed', async () => {
    const onFailureDraftChange = jest.fn();
    const screen = await render(
      <DeliveryDetailScreen
        delivery={delivery}
        pendingActionCount={0}
        failureDraft=""
        bannerMessage={null}
        errorMessage={null}
        isSaving={false}
        onBack={jest.fn()}
        onFailureDraftChange={onFailureDraftChange}
        onPickup={jest.fn()}
        onStart={jest.fn()}
        onComplete={jest.fn()}
        onFail={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('Client absent'));

    expect(onFailureDraftChange).toHaveBeenCalledWith('Client absent');
  });

  it('disables failure submit when the reason is empty', async () => {
    const onFail = jest.fn();
    const screen = await render(
      <DeliveryDetailScreen
        delivery={delivery}
        pendingActionCount={0}
        failureDraft="   "
        bannerMessage={null}
        errorMessage={null}
        isSaving={false}
        onBack={jest.fn()}
        onFailureDraftChange={jest.fn()}
        onPickup={jest.fn()}
        onStart={jest.fn()}
        onComplete={jest.fn()}
        onFail={onFail}
      />
    );

    fireEvent.press(screen.getByTestId('fail-delivery-button'));

    expect(onFail).not.toHaveBeenCalled();
  });

  it('shows the live character counter for the failure reason', async () => {
    const screen = await render(
      <DeliveryDetailScreen
        delivery={delivery}
        pendingActionCount={0}
        failureDraft="Client absent"
        bannerMessage={null}
        errorMessage={null}
        isSaving={false}
        onBack={jest.fn()}
        onFailureDraftChange={jest.fn()}
        onPickup={jest.fn()}
        onStart={jest.fn()}
        onComplete={jest.fn()}
        onFail={jest.fn()}
      />
    );

    expect(screen.getByText('13/180 caracteres')).toBeTruthy();
  });
});