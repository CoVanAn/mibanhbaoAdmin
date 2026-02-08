import { useState, useCallback } from "react";
import { message } from "antd";

interface UseApiOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: any) => void;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * Custom hook for API state management
 * @param apiFunction - The API function to call
 * @param options - Configuration options
 * @returns { data, loading, error, execute, reset }
 */
export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
  const {
    onSuccess,
    onError,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage = "Thao tác thành công!",
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessMessage) {
          message.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err : any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Có lỗi xảy ra";
        setError(errorMessage);

        if (showErrorMessage) {
          message.error(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      apiFunction,
      onSuccess,
      onError,
      showSuccessMessage,
      showErrorMessage,
      successMessage,
    ]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
