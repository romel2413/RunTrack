type ClerkErrorShape = {
  message?: string;
  longMessage?: string;
  errors?: { message?: string; longMessage?: string }[];
};

export function getClerkErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const clerkError = error as ClerkErrorShape;
    return clerkError.errors?.[0]?.longMessage
      ?? clerkError.errors?.[0]?.message
      ?? clerkError.longMessage
      ?? clerkError.message
      ?? fallback;
  }

  return fallback;
}
