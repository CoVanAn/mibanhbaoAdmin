export const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const responseData =
    (error as { response?: { data?: { message?: string } } } | undefined)
      ?.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  return fallback;
};

export const getErrorStatus = (error: unknown): number | undefined => {
  return (error as { response?: { status?: number } } | undefined)?.response
    ?.status;
};
