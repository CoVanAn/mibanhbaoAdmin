export const normalizePhone = (input?: string | null): string => {
  if (!input) return "";

  const digits = input.replace(/\D/g, "");

  // Normalize common VN country code formats to local 0xxxxxxxxx style.
  if (digits.startsWith("84")) {
    if (digits.length === 11) {
      return `0${digits.slice(2)}`;
    }

    if (digits.length === 12 && digits[2] === "0") {
      return digits.slice(2);
    }
  }

  return digits;
};

export const normalizeOptionalPhone = (
  input?: string | null,
): string | null => {
  const normalized = normalizePhone(input);
  return normalized || null;
};
