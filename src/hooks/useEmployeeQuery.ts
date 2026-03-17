import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  CreateEmployeePayload,
  EmployeeListParams,
  UpdateEmployeePayload,
} from "../api/employees";
import {
  createEmployee,
  fetchEmployees,
  fetchEmployeeById,
  resetEmployeePassword,
  toggleEmployeeStatus,
  updateEmployee,
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

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Tạo nhân viên thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Tạo nhân viên thất bại");
    },
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeePayload }) =>
      updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      toast.success("Cập nhật nhân viên thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật nhân viên thất bại");
    },
  });
}

export function useResetEmployeePasswordMutation() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      resetEmployeePassword(id, newPassword),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đặt lại mật khẩu thất bại");
    },
  });
}
