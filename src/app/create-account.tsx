import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { useSignUp } from "@clerk/expo";
import {
  AuthError,
  AuthField,
  AuthPage,
  FieldStack,
  FooterText,
  Heading,
  PrimaryButton,
  authColors,
} from "@/components/auth/auth-ui";
import { getClerkErrorMessage } from "@/components/auth/clerk-error";

export default function CreateAccountScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function createAccount() {
    setErrorMessage("");
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("Complete all fields before creating your account.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Your passwords don't match.");
      return;
    }

    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
      firstName,
      lastName: lastNameParts.join(" ") || undefined,
    });
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "We couldn't create your account. Check your details and try again."));
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setErrorMessage(getClerkErrorMessage(sendError, "Your account was started, but we couldn't send the verification code."));
      return;
    }
    setIsVerifying(true);
  }

  async function verifyEmail() {
    setErrorMessage("");
    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "That code wasn't accepted. Check it and try again."));
      return;
    }
    if (signUp.status !== "complete") {
      setErrorMessage("Your account needs another step before it is ready. Please contact support.");
      return;
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      setErrorMessage(getClerkErrorMessage(finalizeError, "Your account was verified, but we couldn't sign you in."));
      return;
    }
    router.replace("/home");
  }

  async function useDifferentEmail() {
    await signUp.reset();
    setCode("");
    setErrorMessage("");
    setIsVerifying(false);
  }

  return (
    <AuthPage
      footer={
        <FooterText>
          Already have an account?{" "}
          <Text onPress={() => router.replace("/signin")} style={{ color: authColors.green, fontWeight: "700" }}>
            Sign in
          </Text>
        </FooterText>
      }
    >
      <Heading
        title={isVerifying ? "Verify your email" : "Create account"}
        subtitle={isVerifying
          ? `We requested a code for ${email.trim()}. Enter the code from an inbox you can access to finish creating your account.`
          : "Join RunTrack and start your journey every day."}
      />
      <FieldStack>
        {isVerifying ? (
          <AuthField
            icon="mail"
            placeholder="Email verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            returnKeyType="done"
            onSubmitEditing={verifyEmail}
          />
        ) : (
          <>
            <AuthField
              icon="person"
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              returnKeyType="next"
            />
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
              autoComplete="new-password"
              returnKeyType="next"
            />
            <AuthField
              icon="lock"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={createAccount}
            />
          </>
        )}
      </FieldStack>
      {errorMessage ? <AuthError>{errorMessage}</AuthError> : null}
      <PrimaryButton
        title={isVerifying ? "Verify email" : "Create account"}
        onPress={isVerifying ? verifyEmail : createAccount}
        loading={fetchStatus === "fetching"}
      />
      {isVerifying ? (
        <>
          <Text
            onPress={async () => {
              setErrorMessage("");
              const { error } = await signUp.verifications.sendEmailCode();
              if (error) setErrorMessage(getClerkErrorMessage(error, "We couldn't send another code."));
            }}
            style={{ color: authColors.green, textAlign: "center", marginTop: 14, fontSize: 13, fontWeight: "600" }}
          >
            Resend code
          </Text>
          <Text
            onPress={useDifferentEmail}
            style={{ color: authColors.muted, textAlign: "center", marginTop: 12, fontSize: 12 }}
          >
            Use a different email
          </Text>
        </>
      ) : null}
    </AuthPage>
  );
}
