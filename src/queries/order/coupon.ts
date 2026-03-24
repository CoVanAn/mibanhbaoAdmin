import { couponsApi } from "../../api";
import type { CouponListParams, CouponPayload } from "../../api/coupons";
import {
    parseCouponList,
    parseCoupon,
    parseCouponRedemptions,
    type Coupon,
    type CouponRedemption,
} from "../../schema/coupon.schema";

// ─── Coupon Queries ───────────────────────────────────────

export async function fetchCoupons(params: CouponListParams = {}): Promise<Coupon[]> {
    const response = await couponsApi.getAll(params);
    return parseCouponList(response);
}

export async function fetchCouponById(id: number): Promise<Coupon> {
    const response = await couponsApi.getById(id);
    return parseCoupon(response);
}

export async function createCoupon(data: CouponPayload) {
    const response = await couponsApi.create(data);
    return response;
}

export async function updateCoupon(id: number, data: Partial<Omit<CouponPayload, "code">>) {
    const response = await couponsApi.update(id, data);
    return response;
}

export async function deleteCoupon(id: number) {
    const response = await couponsApi.delete(id);
    return response;
}

export async function fetchCouponRedemptions(id: number): Promise<CouponRedemption[]> {
    const response = await couponsApi.getRedemptions(id);
    const data = response?.data ?? [];
    return parseCouponRedemptions(Array.isArray(data) ? data : []);
}
