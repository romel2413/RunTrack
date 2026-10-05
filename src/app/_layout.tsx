import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Text, View } from "react-native";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }}>
        <Text style={{ color: "#14243A", textAlign: "center", fontSize: 16 }}>
          Clerk is not configured. Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the project environment, then restart Expo.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </ClerkProvider>
  );
}
