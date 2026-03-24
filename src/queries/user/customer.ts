import {
    customersApi,
    CustomerListParams,
    ToggleStatusPayload,
} from "../../api/customers";
import { parseCustomerList, parseCustomerDetail } from "../../schema/customer.schema";

/**
 * Fetch paginated customer list with filters
 */
export async function fetchCustomers(params: CustomerListParams = {}) {
    const response = await customersApi.getAll(params);
    return parseCustomerList(response);
}

/**
 * Fetch full customer detail: profile + addresses + orders + coupons
 */
export async function fetchCustomerById(id: number) {
    const response = await customersApi.getById(id);
    if (!response.success || !response.customer) {
        throw new Error("Failed to fetch customer");
    }
    return parseCustomerDetail(response).customer;
}

/**
 * Toggle customer isActive
 */
export async function toggleCustomerStatus(
    id: number,
    payload: ToggleStatusPayload,
) {
    const response = await customersApi.toggleStatus(id, payload);
    return response;
}
