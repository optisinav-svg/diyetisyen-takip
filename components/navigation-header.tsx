import { View, TouchableOpacity, Text, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface NavigationHeaderProps {
  title: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBack?: () => void;
  onHome?: () => void;
}

/**
 * Navigation Header Component
 * Provides back button (to previous page) and home button (to main menu)
 * Used on all screens for consistent navigation
 */
export function NavigationHeader({
  title,
  showBackButton = true,
  showHomeButton = true,
  onBack,
  onHome,
}: NavigationHeaderProps) {
  const router = useRouter();
  const colors = useColors();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push("/");
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }}>
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }}
      >
        {/* Left: Back Button */}
        <View className="flex-row items-center gap-2">
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBack}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Title */}
        <Text
          className="flex-1 text-center text-lg font-semibold"
          style={{ color: colors.foreground }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right: Home Button */}
        <View className="flex-row items-center gap-2">
          {showHomeButton && (
            <TouchableOpacity
              onPress={handleHome}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="home" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
