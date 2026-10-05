import { useClerk, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { AuthError, AuthPage, Heading, PrimaryButton } from "@/components/auth/auth-ui";
import { getClerkErrorMessage } from "@/components/auth/clerk-error";

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignOut() {
    setErrorMessage("");
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error, "We couldn't sign you out. Try again."));
    }
  }

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Runner";

  return (
    <AuthPage>
      <Heading title={`Welcome, ${displayName}`} subtitle="You're signed in and ready for your next walk." />
      {errorMessage ? <AuthError>{errorMessage}</AuthError> : null}
      <PrimaryButton title="Sign out" onPress={handleSignOut} />
    </AuthPage>
  );
}
