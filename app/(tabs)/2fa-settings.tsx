import { ScrollView, Text, View, Switch, Pressable, Alert, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";

export default function TwoFactorSettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<"totp" | "sms">("totp");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleEnable = useCallback(async () => {
    setShowCodeInput(true);
  }, []);

  const handleDisable = useCallback(async () => {
    try {
      setIsEnabled(false);
      Alert.alert("Success", "Two-factor authentication disabled");
    } catch (error) {
      Alert.alert("Error", "Failed to disable 2FA");
    }
  }, []);

  const handleVerifyCode = useCallback(async () => {
    if (!code) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }
    try {
      setIsEnabled(true);
      setShowCodeInput(false);
      setCode("");
      Alert.alert("Success", "Two-factor authentication enabled");
    } catch (error) {
      Alert.alert("Error", "Invalid verification code");
    }
  }, [code]);

  const handleToggle = (value: boolean) => {
    if (value) {
      handleEnable();
    } else {
      handleDisable();
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground mb-2">Two-Factor Authentication</Text>
            <Text className="text-sm text-muted">Add an extra layer of security to your account</Text>
          </View>

          {/* Enable/Disable Toggle */}
          <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-foreground">Enable 2FA</Text>
              <Text className="text-sm text-muted mt-1">Require verification code on login</Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
            />
          </View>

          {/* Method Selection */}
          {!isEnabled && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Choose Method</Text>
              
              {/* TOTP Option */}
              <Pressable
                onPress={() => setMethod("totp")}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: method === "totp" ? "#0a7ea4" : "#f5f5f5",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                  },
                ]}
              >
                <Text className={method === "totp" ? "text-white font-semibold" : "text-foreground font-semibold"}>
                  Authenticator App
                </Text>
                <Text className={method === "totp" ? "text-blue-100 text-sm mt-1" : "text-muted text-sm mt-1"}>
                  Use Google Authenticator, Authy, or Microsoft Authenticator
                </Text>
              </Pressable>

              {/* SMS Option */}
              <Pressable
                onPress={() => setMethod("sms")}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: method === "sms" ? "#0a7ea4" : "#f5f5f5",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                  },
                ]}
              >
                <Text className={method === "sms" ? "text-white font-semibold" : "text-foreground font-semibold"}>
                  SMS
                </Text>
                <Text className={method === "sms" ? "text-blue-100 text-sm mt-1" : "text-muted text-sm mt-1"}>
                  Receive verification codes via text message
                </Text>
              </Pressable>
            </View>
          )}

          {/* Code Input */}
          {showCodeInput && (
            <View className="bg-surface rounded-lg p-4">
              <Text className="text-base font-semibold text-foreground mb-3">Enter Verification Code</Text>
              <TextInput
                placeholder="000000"
                value={code}
                onChangeText={setCode}
                maxLength={6}
                keyboardType="number-pad"
                className="border border-border rounded-lg p-3 text-foreground mb-4"
              />
              <Pressable
                onPress={handleVerifyCode}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: "#0a7ea4",
                    borderRadius: 8,
                    padding: 12,
                  },
                ]}
              >
                <Text className="text-white font-semibold text-center">Verify Code</Text>
              </Pressable>
            </View>
          )}

          {/* Backup Codes */}
          {isEnabled && (
            <View className="bg-surface rounded-lg p-4">
              <Text className="text-base font-semibold text-foreground mb-2">Backup Codes</Text>
              <Text className="text-sm text-muted mb-3">
                Save these codes in a safe place. You can use them to access your account if you lose access to your 2FA device.
              </Text>
              <View className="bg-background rounded p-3 mb-3">
                <Text className="text-xs font-mono text-foreground">
                  • XXXX-XXXX-XXXX{"\n"}
                  • XXXX-XXXX-XXXX{"\n"}
                  • XXXX-XXXX-XXXX{"\n"}
                  • XXXX-XXXX-XXXX{"\n"}
                  • XXXX-XXXX-XXXX
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text className="text-primary font-semibold text-center">Download Backup Codes</Text>
              </Pressable>
            </View>
          )}

          {/* Info */}
          <View className="bg-blue-50 rounded-lg p-4">
            <Text className="text-sm font-medium text-blue-900 mb-2">Security Benefits</Text>
            <Text className="text-xs text-blue-800 leading-relaxed">
              • Protects against password breaches{"\n"}
              • Requires physical access to your phone{"\n"}
              • Backup codes for emergency access{"\n"}
              • Can be disabled anytime
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
