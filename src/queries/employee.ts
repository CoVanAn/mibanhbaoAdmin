import {
  employeesApi,
  EmployeeListParams,
  ToggleEmployeeStatusPayload,
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
