import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = {
  ink: "#14243A",
  muted: "#60738A",
  green: "#07966F",
  line: "#DCE5EE",
  pale: "#F0FAF8",
};

export function AuthPage({
  children,
  footer,
  back,
}: {
  children: ReactNode;
  footer?: ReactNode;
  back?: () => void;
}) {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.safe, { width }]} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.pageContent, { width }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.waveArea}>
            <View style={styles.wave} />
            <View style={styles.waveCutout} />
          </View>
          <View style={[styles.screenBody, { width: Math.max(0, width - 50) }]}>
            {back ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={back}
                hitSlop={12}
                style={styles.backButton}
              >
                <AuthIcon name="back" size={20} />
              </Pressable>
            ) : null}
            <Brand />
            {children}
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Brand() {
  return (
    <View style={styles.brand}>
      <BrandLogo />
    </View>
  );
}

export function BrandLogo() {
  return (
    <View style={styles.logoFrame}>
      <Image
        source={require("@/assets/images/Logo.png")}
        contentFit="cover"
        accessibilityLabel="RunTrack"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export function AuthField({
  icon,
  secure,
  ...props
}: TextInputProps & { icon: "mail" | "person" | "lock"; secure?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.inputWrap}>
      <AuthIcon name={icon} size={16} />
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#8393A6"
        underlineColorAndroid="transparent"
        secureTextEntry={secure && !showPassword}
        autoCapitalize={props.keyboardType === "email-address" ? "none" : props.autoCapitalize}
      />
      {secure ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          onPress={() => setShowPassword((visible) => !visible)}
          hitSlop={8}
        >
          <AuthIcon name={showPassword ? "eyeOff" : "eye"} size={17} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.primaryButton, (pressed || disabled || loading) && styles.buttonPressed]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{title}</Text>}
    </Pressable>
  );
}

export function InlineLink({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={8}>
      <Text style={styles.inlineLink}>{children}</Text>
    </Pressable>
  );
}

export function FieldStack({ children }: { children: ReactNode }) {
  return <View style={styles.fieldStack}>{children}</View>;
}

export function OrDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.orText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function GoogleButton({ onPress, disabled = false }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed, disabled && { opacity: 0.6 }]}
    >
      <GoogleMark />
      <Text style={styles.googleText}>Continue with Google</Text>
    </Pressable>
  );
}

function GoogleMark() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.27c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Svg>
  );
}

function AuthIcon({ name, size }: { name: "back" | "mail" | "person" | "lock" | "eye" | "eyeOff" | "check"; size: number }) {
  const common = { stroke: "#667C91", strokeWidth: 1.65, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "back" ? <Path d="m14.5 5-7 7 7 7M8 12h12" {...common} /> : null}
      {name === "mail" ? (
        <>
          <Rect x="3.5" y="5.5" width="17" height="13" rx="2" {...common} />
          <Path d="m4.5 7 7.5 6 7.5-6" {...common} />
        </>
      ) : null}
      {name === "person" ? (
        <>
          <Circle cx="12" cy="8" r="3.25" {...common} />
          <Path d="M5.5 20c.5-3.6 2.7-5.5 6.5-5.5s6 1.9 6.5 5.5" {...common} />
        </>
      ) : null}
      {name === "lock" ? (
        <>
          <Rect x="4.5" y="10" width="15" height="11" rx="2" {...common} />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" {...common} />
        </>
      ) : null}
      {name === "eye" || name === "eyeOff" ? (
        <>
          <Path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" {...common} />
          <Circle cx="12" cy="12" r="2.5" {...common} />
          {name === "eyeOff" ? <Path d="m4 4 16 16" {...common} /> : null}
        </>
      ) : null}
      {name === "check" ? <Path d="m5 12 4.5 4.5L19 7" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
    </Svg>
  );
}

export function FooterText({ children }: { children: ReactNode }) {
  return <Text style={styles.footerText}>{children}</Text>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <Text style={styles.notice}>{children}</Text>;
}

export function AuthError({ children }: { children: ReactNode }) {
  return <Text accessibilityRole="alert" style={styles.authError}>{children}</Text>;
}

export function SuccessMark() {
  return (
    <View style={styles.successArt}>
      <View style={styles.mailCard}>
        <AuthIcon name="mail" size={48} />
      </View>
      <View style={styles.checkBadge}>
        <AuthIcon name="check" size={17} />
      </View>
    </View>
  );
}

export const authColors = colors;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF", overflow: "hidden" },
  flex: { flex: 1 },
  pageContent: { flexGrow: 1, paddingTop: 29, paddingBottom: 26 },
  screenBody: { flexGrow: 1, marginHorizontal: 25 },
  waveArea: { position: "absolute", top: 0, left: 0, right: 0, height: 155, overflow: "hidden", pointerEvents: "none" },
  wave: {
    position: "absolute",
    top: -118,
    right: -122,
    width: 440,
    height: 248,
    borderRadius: 220,
    backgroundColor: colors.pale,
    transform: [{ rotate: "-10deg" }],
  },
  waveCutout: {
    position: "absolute",
    top: -107,
    left: -178,
    width: 355,
    height: 191,
    borderRadius: 190,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-10deg" }],
  },
  backButton: { position: "absolute", top: 26, left: 23, zIndex: 2, padding: 4 },
  brand: { alignItems: "center", justifyContent: "center", marginTop: 2, marginBottom: 23 },
  logoFrame: { width: 208, height: 138, overflow: "hidden", borderRadius: 22 },
  heading: { marginTop: 1, marginBottom: 17 },
  title: { color: colors.ink, fontSize: 20, lineHeight: 25, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  fieldStack: { gap: 9 },
  inputWrap: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  input: { flex: 1, color: colors.ink, fontSize: 12, height: "100%", paddingHorizontal: 9 },
  primaryButton: {
    minHeight: 43,
    borderRadius: 12,
    backgroundColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  buttonPressed: { opacity: 0.83 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  inlineLink: { color: colors.green, fontSize: 10, fontWeight: "600", textAlign: "center" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 10 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#E3EAF0" },
  orText: { color: "#8290A0", fontSize: 10 },
  googleButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  googleText: { color: colors.ink, fontSize: 11, fontWeight: "600" },
  footer: { marginTop: "auto", paddingTop: 23 },
  footerText: { color: colors.muted, textAlign: "center", fontSize: 10, lineHeight: 16 },
  notice: { color: colors.muted, textAlign: "center", fontSize: 11, lineHeight: 17, marginTop: 13 },
  authError: { color: "#B42318", fontSize: 12, lineHeight: 17, marginTop: 10 },
  successArt: {
    alignSelf: "center",
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#EAF8F5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 44,
    marginBottom: 23,
  },
  mailCard: {
    width: 70,
    height: 53,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadge: {
    position: "absolute",
    right: 11,
    bottom: 19,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: "#EAF8F5",
  },
});
