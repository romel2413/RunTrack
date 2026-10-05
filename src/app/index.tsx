import { router } from "expo-router";
import { useAuth } from "@clerk/expo";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "@/components/auth/auth-ui";

const landscape = require("@/assets/images/authimage.png");

export default function WelcomeScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/home");
  }, [isLoaded, isSignedIn]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image source={landscape} contentFit="cover" style={StyleSheet.absoluteFill} />
      <View style={styles.scrim} />

      <View style={styles.brand}>
        <BrandLogo />
        <Text style={styles.tagline}>Better Runs. A Healthier You.</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.message}>Every step takes you somewhere.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/signin")}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        <Text style={styles.signInPrompt}>
          Already have an account?{" "}
          <Text style={styles.signInLink} onPress={() => router.push("/signin")}>
            Sign in
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#173638" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(5, 25, 29, 0.28)" },
  brand: { alignItems: "center", marginTop: "25%" },
  tagline: { color: "rgba(255,255,255,0.92)", fontSize: 13, marginTop: 7 },
  bottom: { marginTop: "auto", paddingHorizontal: 24, paddingBottom: 30, alignItems: "center" },
  message: { color: "rgba(255,255,255,0.94)", fontSize: 14, marginBottom: 18 },
  button: {
    width: "100%",
    height: 52,
    borderRadius: 15,
    backgroundColor: "#07966F",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.84 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  signInPrompt: { color: "rgba(255,255,255,0.88)", fontSize: 12, marginTop: 16 },
  signInLink: { color: "#A7F1D7", fontWeight: "700" },
});
