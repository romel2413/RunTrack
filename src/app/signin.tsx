import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { useSignIn } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import {
  AuthError,
  AuthField,
  AuthPage,
  FieldStack,
  FooterText,
  GoogleButton,
  Heading,
  InlineLink,
  OrDivider,
  PrimaryButton,
  authColors,
} from "@/components/auth/auth-ui";
import { getClerkErrorMessage } from "@/components/auth/clerk-error";

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [requiresCode, setRequiresCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setIsGoogleLoading(true);
    try {
      const { createdSessionId, signUp, authSessionResult } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId) {
        router.replace("/home");
        return;
      }

      if (signUp?.status === "missing_requirements") {
        setErrorMessage("Your Google account needs more information before sign-in can finish. Please complete sign-up with your email instead.");
        return;
      }

      // A cancelled browser session returns without a session and is not an error.
      if (authSessionResult?.type === "cancel") return;
    } catch (error) {
      setErrorMessage(
        getClerkErrorMessage(
          error,
          "Google sign-in couldn't start. Make sure Google is enabled in your Clerk Dashboard and try again.",
        ),
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function finishSignIn() {
    const { error } = await signIn.finalize();
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "We couldn't finish signing you in."));
      return;
    }
    router.replace("/home");
  }

  async function handleSignIn() {
    setErrorMessage("");
    const { error } = await signIn.password({ emailAddress: email.trim(), password });
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "Check your email and password, then try again."));
      return;
    }

    if (signIn.status === "complete") {
      await finishSignIn();
      return;
    }

    if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
      const emailFactor = signIn.supportedSecondFactors.find((factor) => factor.strategy === "email_code");
      if (!emailFactor) {
        setErrorMessage("Your account needs another verification method. Contact support for help signing in.");
        return;
      }
      const { error: codeError } = await signIn.mfa.sendEmailCode();
      if (codeError) {
        setErrorMessage(getClerkErrorMessage(codeError, "We couldn't send a verification code."));
        return;
      }
      setRequiresCode(true);
      return;
    }

    setErrorMessage("This sign-in needs another verification step. Please try again or use account recovery.");
  }

  async function verifyCode() {
    setErrorMessage("");
    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "That code wasn't accepted. Check it and try again."));
      return;
    }
    if (signIn.status === "complete") await finishSignIn();
  }

  return (
    <AuthPage
      footer={
        <FooterText>
          Don&apos;t have an account?{" "}
          <Text onPress={() => router.push("/create-account")} style={{ color: authColors.green, fontWeight: "700" }}>
            Sign up
          </Text>
        </FooterText>
      }
    >
      <Heading title="Welcome back" subtitle="Sign in to continue" />
      {requiresCode ? (
        <>
          <FieldStack>
            <AuthField
              icon="mail"
              placeholder="Email verification code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              returnKeyType="done"
            />
          </FieldStack>
          {errorMessage ? <AuthError>{errorMessage}</AuthError> : null}
          <PrimaryButton title="Verify and sign in" onPress={verifyCode} loading={fetchStatus === "fetching"} />
        </>
      ) : (
        <>
          <FieldStack>
            <AuthField
              icon="mail"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
            <AuthField
              icon="lock"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secure
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />
          </FieldStack>
          {errorMessage ? <AuthError>{errorMessage}</AuthError> : null}
          <View style={{ alignItems: "flex-end", marginTop: 10 }}>
            <InlineLink onPress={() => router.push("/forgot-password")}>Forgot password?</InlineLink>
          </View>
          <PrimaryButton title="Sign in" onPress={handleSignIn} loading={fetchStatus === "fetching"} />
          <OrDivider />
          <GoogleButton onPress={handleGoogleSignIn} disabled={isGoogleLoading || fetchStatus === "fetching"} />
        </>
      )}
    </AuthPage>
  );
}
