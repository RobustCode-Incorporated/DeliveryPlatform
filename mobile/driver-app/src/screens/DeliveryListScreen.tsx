import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getSyncStatus } from '../app/syncStatus';
import type { DriverDeliveryDto, StoredSession } from '../types/api';

interface DeliveryListScreenProps {
  session: StoredSession;
  deliveries: DriverDeliveryDto[];
  pendingActionCountByDelivery: Record<number, number>;
  blockedActionCount: number;
  lastSuccessfulSync: string | null;
  bannerMessage: string | null;
  errorMessage: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetryQueuedActions: () => void;
  onDiscardBlockedActions: () => void;
  onLogout: () => void;
  onOpenDelivery: (deliveryId: number) => void;
}

export function DeliveryListScreen({
  session,
  deliveries,
  pendingActionCountByDelivery,
  blockedActionCount,
  lastSuccessfulSync,
  bannerMessage,
  errorMessage,
  isRefreshing,
  onRefresh,
  onRetryQueuedActions,
  onDiscardBlockedActions,
  onLogout,
  onOpenDelivery,
}: DeliveryListScreenProps) {
  const syncStatus = getSyncStatus(lastSuccessfulSync);

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0f766e" />}
    >
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Session active</Text>
        <Text style={styles.title}>Bonjour {session.email}</Text>
        <Text style={styles.subtitle}>Role detecte: {session.role}</Text>
        {syncStatus ? (
          <Text style={[styles.syncText, syncStatus.isStale && styles.syncTextStale]}>{syncStatus.label}</Text>
        ) : null}

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            style={[styles.secondaryButton, isRefreshing && styles.buttonDisabled]}
            disabled={isRefreshing}
            onPress={onRefresh}
          >
            <Text style={styles.secondaryButtonText}>{isRefreshing ? 'Actualisation...' : 'Actualiser'}</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={onLogout}>
            <Text style={styles.ghostButtonText}>Deconnexion</Text>
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.secondaryButton} onPress={onRetryQueuedActions}>
            <Text style={styles.secondaryButtonText}>Rejouer la file</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={onDiscardBlockedActions}>
            <Text style={styles.ghostButtonText}>Supprimer les conflits ({blockedActionCount})</Text>
          </Pressable>
        </View>
      </View>

      {blockedActionCount > 0 ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Actions en attente bloquees</Text>
          <Text style={styles.warningText}>
            {blockedActionCount} action(s) exigent une revue manuelle avant la prochaine synchro automatique.
          </Text>
        </View>
      ) : null}

      {bannerMessage ? <Text style={styles.successText}>{bannerMessage}</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {isRefreshing && deliveries.length === 0 ? (
        <ActivityIndicator size="large" color="#0f766e" />
      ) : null}

      {deliveries.length === 0 && !isRefreshing ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aucune livraison assignee</Text>
          <Text style={styles.emptyText}>Les livraisons du chauffeur apparaitront ici via l API reelle.</Text>
        </View>
      ) : null}

      {deliveries.map((delivery) => (
        <Pressable
          key={delivery.id}
          accessibilityRole="button"
          style={styles.deliveryCard}
          onPress={() => onOpenDelivery(delivery.id)}
        >
          <View style={styles.deliveryHeader}>
            <Text style={styles.deliveryTitle}>Livraison #{delivery.id}</Text>
            <Text style={styles.statusBadge}>{delivery.status}</Text>
          </View>
          <Text style={styles.deliveryMeta}>Retrait: {delivery.pickupAddress}</Text>
          <Text style={styles.deliveryMeta}>Destination: {delivery.deliveryAddress}</Text>
          {delivery.restaurant?.name ? <Text style={styles.deliveryMeta}>Restaurant: {delivery.restaurant.name}</Text> : null}
          {pendingActionCountByDelivery[delivery.id] ? (
            <Text style={styles.pendingText}>Action en attente: {pendingActionCountByDelivery[delivery.id]}</Text>
          ) : null}
          <Text style={styles.linkText}>Ouvrir le detail</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  headerCard: {
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  syncText: {
    fontSize: 13,
    color: '#64748b',
  },
  syncTextStale: {
    color: '#b45309',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
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
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ghostButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 14,
  },
  warningCard: {
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    padding: 16,
    gap: 6,
  },
  warningTitle: {
    color: '#9a3412',
    fontSize: 15,
    fontWeight: '700',
  },
  warningText: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 20,
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
  emptyCard: {
    borderRadius: 22,
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  deliveryCard: {
    borderRadius: 22,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 10,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  deliveryTitle: {
    fontSize: 18,
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
  deliveryMeta: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  pendingText: {
    fontSize: 13,
    color: '#b45309',
    fontWeight: '600',
  },
  linkText: {
    color: '#0f766e',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});