import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DriverDeliveryDto } from '../types/api';

const quickFailureReasons = [
  'Client absent',
  'Adresse introuvable',
  'Restaurant ferme',
  'Incident vehicule',
];

interface DeliveryDetailScreenProps {
  delivery: DriverDeliveryDto;
  pendingActionCount: number;
  failureDraft: string;
  bannerMessage: string | null;
  errorMessage: string | null;
  isSaving: boolean;
  onBack: () => void;
  onFailureDraftChange: (value: string) => void;
  onPickup: () => void;
  onStart: () => void;
  onComplete: () => void;
  onFail: () => void;
}

export function DeliveryDetailScreen({
  delivery,
  pendingActionCount,
  failureDraft,
  bannerMessage,
  errorMessage,
  isSaving,
  onBack,
  onFailureDraftChange,
  onPickup,
  onStart,
  onComplete,
  onFail,
}: DeliveryDetailScreenProps) {
  const trimmedFailureDraft = failureDraft.trim();
  const isFailureDraftInvalid = !trimmedFailureDraft || trimmedFailureDraft.length > 180;

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Pressable accessibilityRole="button" style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Retour aux livraisons</Text>
      </Pressable>

      <View style={styles.detailCard}>
        <Text style={styles.eyebrow}>Detail livraison</Text>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Livraison #{delivery.id}</Text>
          <Text style={styles.statusBadge}>{delivery.status}</Text>
        </View>

        <Text style={styles.metaLine}>Retrait: {delivery.pickupAddress}</Text>
        <Text style={styles.metaLine}>Destination: {delivery.deliveryAddress}</Text>
        {delivery.restaurant?.name ? <Text style={styles.metaLine}>Restaurant: {delivery.restaurant.name}</Text> : null}
        {delivery.restaurant?.address ? <Text style={styles.metaLine}>Adresse restaurant: {delivery.restaurant.address}</Text> : null}
        {delivery.customer?.email ? <Text style={styles.metaLine}>Client: {delivery.customer.email}</Text> : null}
        {delivery.description ? <Text style={styles.metaLine}>Notes: {delivery.description}</Text> : null}
        <Text style={styles.metaLine}>Creee: {delivery.createdAt}</Text>
        {delivery.updatedAt ? <Text style={styles.metaLine}>Mise a jour: {delivery.updatedAt}</Text> : null}
        {pendingActionCount ? <Text style={styles.pendingText}>Actions en attente: {pendingActionCount}</Text> : null}
      </View>

      {bannerMessage ? <Text style={styles.successText}>{bannerMessage}</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.actionGroup}>
        {delivery.status === 'ASSIGNED' ? (
          <Pressable style={[styles.primaryButton, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={onPickup}>
            <Text style={styles.primaryButtonText}>Marquer recuperee</Text>
          </Pressable>
        ) : null}

        {delivery.status === 'PICKED_UP' ? (
          <Pressable style={[styles.primaryButton, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={onStart}>
            <Text style={styles.primaryButtonText}>Demarrer la livraison</Text>
          </Pressable>
        ) : null}

        {delivery.status === 'IN_TRANSIT' ? (
          <Pressable style={[styles.primaryButton, isSaving && styles.buttonDisabled]} disabled={isSaving} onPress={onComplete}>
            <Text style={styles.primaryButtonText}>Marquer livree</Text>
          </Pressable>
        ) : null}
      </View>

      {(delivery.status === 'ASSIGNED' || delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT') ? (
        <View style={styles.failurePanel}>
          <Text style={styles.failureLabel}>Motif d echec</Text>
          <View style={styles.quickReasonRow}>
            {quickFailureReasons.map((reason) => (
              <Pressable
                key={reason}
                accessibilityRole="button"
                style={styles.quickReasonChip}
                onPress={() => onFailureDraftChange(reason)}
              >
                <Text style={styles.quickReasonChipText}>{reason}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            multiline
            placeholder="Exemple: client absent, adresse introuvable..."
            placeholderTextColor="#64748b"
            style={styles.textArea}
            value={failureDraft}
            onChangeText={onFailureDraftChange}
          />
          <Text style={[styles.counterText, trimmedFailureDraft.length > 180 && styles.counterTextError]}>
            {trimmedFailureDraft.length}/180 caracteres
          </Text>
          <Pressable
            testID="fail-delivery-button"
            style={[styles.secondaryButton, (isSaving || isFailureDraftInvalid) && styles.buttonDisabled]}
            disabled={isSaving || isFailureDraftInvalid}
            onPress={onFail}
          >
            <Text style={styles.secondaryButtonText}>Signaler un echec</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#0f766e',
    fontWeight: '700',
    fontSize: 14,
  },
  detailCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#0f766e',
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#ecfeff',
    color: '#155e75',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  metaLine: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  pendingText: {
    fontSize: 13,
    color: '#b45309',
    fontWeight: '600',
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  actionGroup: {
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 14,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
  },
  quickReasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReasonChip: {
    borderRadius: 999,
    backgroundColor: '#ecfeff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickReasonChipText: {
    color: '#155e75',
    fontSize: 13,
    fontWeight: '600',
  },
  counterText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'right',
  },
  counterTextError: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  failurePanel: {
    gap: 10,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    padding: 18,
  },
  failureLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});