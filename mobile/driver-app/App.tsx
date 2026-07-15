import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';
import { useDriverApp } from './src/app/useDriverApp';
import { DeliveryDetailScreen } from './src/screens/DeliveryDetailScreen';
import { DeliveryListScreen } from './src/screens/DeliveryListScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export function App() {
  const app = useDriverApp();

  if (app.isRestoring) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.helperText}>Restauration de la session...</Text>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      {!app.session ? (
        <LoginScreen
          email={app.email}
          password={app.password}
          errorMessage={app.errorMessage}
          isSubmitting={app.isSubmitting}
          onEmailChange={app.setEmail}
          onPasswordChange={app.setPassword}
          onSubmit={() => void app.handleLogin()}
        />
      ) : app.screen === 'detail' && app.selectedDelivery ? (
        <DeliveryDetailScreen
          delivery={app.selectedDelivery}
          pendingActionCount={app.pendingActionCountByDelivery[app.selectedDelivery.id] ?? 0}
          failureDraft={app.failureDrafts[app.selectedDelivery.id] ?? ''}
          bannerMessage={app.bannerMessage}
          errorMessage={app.errorMessage}
          isSaving={app.savingDeliveryId === app.selectedDelivery.id}
          onBack={app.closeDelivery}
          onFailureDraftChange={(value) => app.setFailureDraft(app.selectedDelivery!.id, value)}
          onPickup={() => void app.actionHandlers.pickup(app.selectedDelivery!.id)}
          onStart={() => void app.actionHandlers.start(app.selectedDelivery!.id)}
          onComplete={() => void app.actionHandlers.complete(app.selectedDelivery!.id)}
          onFail={() => void app.handleFailDelivery(app.selectedDelivery!.id)}
        />
      ) : (
        <DeliveryListScreen
          session={app.session}
          deliveries={app.deliveries}
          pendingActionCountByDelivery={app.pendingActionCountByDelivery}
          blockedActionCount={app.blockedActions.length}
          lastSuccessfulSync={app.lastSuccessfulSync}
          bannerMessage={app.bannerMessage}
          errorMessage={app.errorMessage}
          isRefreshing={app.isRefreshing}
          onRefresh={() => void app.refreshDeliveries()}
          onRetryQueuedActions={() => void app.retryQueuedActions()}
          onDiscardBlockedActions={() => void app.discardBlockedQueuedActions()}
          onLogout={() => void app.handleLogout()}
          onOpenDelivery={app.openDelivery}
        />
      )}
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centeredScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  helperText: {
    color: '#475569',
    fontSize: 15,
  },
});
