import { useState, useCallback } from "react";
import { message } from "antd";

/**
 * Custom hook for API state management
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage = "Thao tác thành công!",
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
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
      } catch (err) {
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
