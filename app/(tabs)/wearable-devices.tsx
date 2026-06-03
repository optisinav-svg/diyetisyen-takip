import { ScrollView, Text, View, Pressable, Alert, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";

interface WearableDevice {
  id: string;
  name: string;
  type: "apple_health" | "google_fit";
  lastSync: string;
  autoSync: boolean;
}

export default function WearableDevicesScreen() {
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [showConnectOptions, setShowConnectOptions] = useState(false);

  const handleConnectAppleHealth = useCallback(async () => {
    try {
      Alert.alert("Success", "Apple Health connected");
      setShowConnectOptions(false);
    } catch (error) {
      Alert.alert("Error", "Failed to connect Apple Health");
    }
  }, []);

  const handleConnectGoogleFit = useCallback(async () => {
    try {
      Alert.alert("Success", "Google Fit connected");
      setShowConnectOptions(false);
    } catch (error) {
      Alert.alert("Error", "Failed to connect Google Fit");
    }
  }, []);

  const handleDisconnect = useCallback(async (deviceId: string) => {
    try {
      Alert.alert("Success", "Device disconnected");
      setDevices(devices.filter((d) => d.id !== deviceId));
    } catch (error) {
      Alert.alert("Error", "Failed to disconnect device");
    }
  }, [devices]);

  const handleSync = useCallback(async (deviceId: string) => {
    try {
      Alert.alert("Success", "Syncing data...");
    } catch (error) {
      Alert.alert("Error", "Failed to sync data");
    }
  }, []);

  const handleToggleAutoSync = useCallback(async (deviceId: string, enabled: boolean) => {
    try {
      setDevices(
        devices.map((d) =>
          d.id === deviceId ? { ...d, autoSync: enabled } : d
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update auto-sync setting");
    }
  }, [devices]);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground mb-2">Wearable Devices</Text>
            <Text className="text-sm text-muted">Connect and sync data from your health devices</Text>
          </View>

          {/* Connected Devices */}
          {devices.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Connected Devices</Text>
              {devices.map((device) => (
                <View key={device.id} className="bg-surface rounded-lg p-4 mb-3">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{device.name}</Text>
                      <Text className="text-sm text-muted mt-1">
                        Last synced: {device.lastSync}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDisconnect(device.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                      <Text className="text-error font-medium">Disconnect</Text>
                    </Pressable>
                  </View>

                  {/* Auto Sync Toggle */}
                  <View className="flex-row items-center justify-between border-t border-border pt-3">
                    <Text className="text-sm text-foreground">Auto-sync data</Text>
                    <Switch
                      value={device.autoSync}
                      onValueChange={(value) => handleToggleAutoSync(device.id, value)}
                    />
                  </View>

                  {/* Sync Button */}
                  <Pressable
                    onPress={() => handleSync(device.id)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.8 : 1,
                        backgroundColor: "#0a7ea4",
                        borderRadius: 8,
                        padding: 10,
                        marginTop: 12,
                      },
                    ]}
                  >
                    <Text className="text-white font-semibold text-center text-sm">Sync Now</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* No Devices */}
          {devices.length === 0 && !showConnectOptions && (
            <View className="bg-surface rounded-lg p-4 items-center">
              <Text className="text-sm text-muted text-center mb-4">
                No wearable devices connected yet
              </Text>
              <Pressable
                onPress={() => setShowConnectOptions(true)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: "#0a7ea4",
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  },
                ]}
              >
                <Text className="text-white font-semibold">Connect Device</Text>
              </Pressable>
            </View>
          )}

          {/* Connect Options */}
          {showConnectOptions && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Connect Device</Text>

              {/* Apple Health */}
              <Pressable
                onPress={handleConnectAppleHealth}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  },
                ]}
              >
                <Text className="text-base font-semibold text-foreground">Apple Health</Text>
                <Text className="text-sm text-muted mt-1">
                  Sync health data from your iPhone
                </Text>
              </Pressable>

              {/* Google Fit */}
              <Pressable
                onPress={handleConnectGoogleFit}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  },
                ]}
              >
                <Text className="text-base font-semibold text-foreground">Google Fit</Text>
                <Text className="text-sm text-muted mt-1">
                  Sync health data from your Android device
                </Text>
              </Pressable>

              {/* Cancel */}
              <Pressable
                onPress={() => setShowConnectOptions(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text className="text-primary font-semibold text-center">Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* Supported Data */}
          <View className="bg-blue-50 rounded-lg p-4">
            <Text className="text-sm font-medium text-blue-900 mb-2">Supported Data</Text>
            <Text className="text-xs text-blue-800 leading-relaxed">
              • Steps and activity{"\n"}
              • Heart rate{"\n"}
              • Sleep data{"\n"}
              • Calories burned{"\n"}
              • Workouts and exercises
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
