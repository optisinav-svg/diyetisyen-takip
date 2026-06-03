import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export function SectionCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <View className={cn("rounded-3xl border border-border bg-surface p-4", className)}>{children}</View>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-xl font-semibold text-foreground">{title}</Text>
      {subtitle ? <Text className="text-sm leading-5 text-muted">{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonBase,
        { backgroundColor: disabled ? colors.border : colors.primary },
        pressed && !disabled ? styles.buttonPressed : null,
      ]}
    >
      <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      <Text style={[styles.buttonText, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function Pill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const colors = useColors();
  const toneMap = {
    neutral: { backgroundColor: colors.background, color: colors.foreground },
    success: { backgroundColor: "#E8F7EE", color: colors.success },
    warning: { backgroundColor: "#FFF4DE", color: colors.warning },
    danger: { backgroundColor: "#FDEBEC", color: colors.error },
  } as const;

  return (
    <View className="self-start rounded-full px-3 py-1" style={{ backgroundColor: toneMap[tone].backgroundColor }}>
      <Text style={{ color: toneMap[tone].color, fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      {hint ? <Text className="text-xs leading-4 text-muted">{hint}</Text> : null}
    </View>
  );
}

export function AppTextInput(props: TextInputProps) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[
        styles.input,
        {
          color: colors.foreground,
          borderColor: colors.border,
          backgroundColor: colors.background,
        },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
