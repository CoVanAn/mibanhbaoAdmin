import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EmployeeListParams } from "../api/employees";
import {
  fetchEmployees,
  fetchEmployeeById,
  toggleEmployeeStatus,
} from "../queries/employee";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: EmployeeListParams = {}) =>
    [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
};

export function useEmployeesQuery(params: EmployeeListParams = {}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => fetchEmployees(params),
    placeholderData: keepPreviousData,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useEmployeeQuery(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
  });
}

export function useToggleEmployeeStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: number;
      isActive: boolean;
    }) => toggleEmployeeStatus(id, { isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.id),
      });
      toast.success(
        variables.isActive
          ? "Kích hoạt tài khoản thành công!"
          : "Vô hiệu hoá tài khoản thành công!",
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Cập nhật trạng thái thất bại",
      );
    },
  });
}
