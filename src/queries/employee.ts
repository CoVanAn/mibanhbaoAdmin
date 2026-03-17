import {
  employeesApi,
  CreateEmployeePayload,
  EmployeeListParams,
  ToggleEmployeeStatusPayload,
  UpdateEmployeePayload,
} from "../api/employees";
import { parseEmployeeList, parseEmployeeDetail } from "../schema/employee.schema";

export async function fetchEmployees(params: EmployeeListParams = {}) {
  const response = await employeesApi.getAll(params);
  return parseEmployeeList(response);
}

export async function fetchEmployeeById(id: number) {
  const response = await employeesApi.getById(id);
  if (!response.success || !response.employee) {
    throw new Error("Failed to fetch employee");
  }
  return parseEmployeeDetail(response).employee;
}

export async function toggleEmployeeStatus(
  id: number,
  payload: ToggleEmployeeStatusPayload,
) {
  const response = await employeesApi.toggleStatus(id, payload);
  return response;
}

export async function createEmployee(payload: CreateEmployeePayload) {
  const response = await employeesApi.create(payload);
  return response;
}

export async function updateEmployee(id: number, payload: UpdateEmployeePayload) {
  const response = await employeesApi.update(id, payload);
  return response;
}

export async function resetEmployeePassword(id: number, newPassword: string) {
  const response = await employeesApi.resetPassword(id, { newPassword });
  return response;
}
