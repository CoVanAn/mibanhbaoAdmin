// Re-export apiClient from lib/api.js for backward compatibility
// All API calls should use the centralized apiClient with proper token handling
import apiClient from "../lib/api";

export default apiClient;
