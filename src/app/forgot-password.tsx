import { useSignIn } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import {
  AuthError,
  AuthField,
  AuthPage,
  FieldStack,
  Heading,
  InlineLink,
  PrimaryButton,
} from "@/components/auth/auth-ui";
import { getClerkErrorMessage } from "@/components/auth/clerk-error";

type ResetStep = "email" | "code" | "password";

export default function ForgotPasswordScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<ResetStep>("email");
  const [errorMessage, setErrorMessage] = useState("");

  async function sendResetCode() {
    setErrorMessage("");
    const { error: createError } = await signIn.create({ identifier: email.trim() });
    if (createError) {
      setErrorMessage(getClerkErrorMessage(createError, "We couldn't find an account for that email."));
      return;
    }
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "We couldn't send a password reset code."));
      return;
    }
    setStep("code");
  }

  async function verifyResetCode() {
    setErrorMessage("");
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "That code wasn't accepted. Check it and try again."));
      return;
    }
    setStep("password");
  }

  async function saveNewPassword() {
    setErrorMessage("");
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) {
      setErrorMessage(getClerkErrorMessage(error, "We couldn't update your password."));
      return;
    }
    if (signIn.status !== "complete") {
      setErrorMessage("Your password was updated, but one more sign-in step is required.");
      return;
    }
    const { error: finalizeError } = await signIn.finalize();
    if (finalizeError) {
      setErrorMessage(getClerkErrorMessage(finalizeError, "Your password was updated, but we couldn't sign you in."));
      return;
    }
    router.replace("/home");
  }

  const title = step === "email" ? "Forgot password" : step === "code" ? "Check your email" : "Choose a new password";
  const subtitle = step === "email"
    ? "Enter your email and we'll send you a reset code."
    : step === "code"
      ? `Enter the password reset code sent to ${email.trim()}.`
      : "Your new password must be different from the old one.";
  const submit = step === "email" ? sendResetCode : step === "code" ? verifyResetCode : saveNewPassword;

  return (
    <AuthPage back={() => step === "email" ? router.back() : setStep(step === "password" ? "code" : "email")}>
      <Heading title={title} subtitle={subtitle} />
      <FieldStack>
        {step === "email" ? (
          <AuthField
            icon="mail"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={sendResetCode}
          />
        ) : step === "code" ? (
          <AuthField
            icon="mail"
            placeholder="Password reset code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            returnKeyType="done"
            onSubmitEditing={verifyResetCode}
          />
        ) : (
          <AuthField
            icon="lock"
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secure
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={saveNewPassword}
          />
        )}
      </FieldStack>
      {errorMessage ? <AuthError>{errorMessage}</AuthError> : null}
      <PrimaryButton
        title={step === "email" ? "Send reset code" : step === "code" ? "Verify code" : "Update password"}
        onPress={submit}
        loading={fetchStatus === "fetching"}
      />
      {step === "code" ? (
        <InlineLink onPress={sendResetCode}>Resend code</InlineLink>
      ) : null}
      <InlineLink onPress={() => router.replace("/signin")}>Back to sign in</InlineLink>
    </AuthPage>
  );
}
