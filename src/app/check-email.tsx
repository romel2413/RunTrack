import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import {
  AuthPage,
  Heading,
  PrimaryButton,
  SuccessMark,
  authColors,
} from "@/components/auth/auth-ui";

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const address = typeof email === "string" && email.length > 0 ? email : "your email address";

  return (
    <AuthPage>
      <View style={{ flex: 1 }}>
        <SuccessMark />
        <Heading title="Check your email" subtitle={`We’ve sent a password reset link to ${address}.`} />
        <PrimaryButton title="Back to sign in" onPress={() => router.replace("/signin")} />
        <Text style={{ color: authColors.muted, textAlign: "center", fontSize: 11, marginTop: 15 }}>
          Didn’t receive an email? Check your spam folder.
        </Text>
      </View>
    </AuthPage>
  );
}
