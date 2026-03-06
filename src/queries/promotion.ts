import { promotionsApi, couponsApi } from "../api";
import type { PromotionListParams, PromotionPayload, PromotionTargetPayload } from "../api/promotions";
import type { CouponListParams, CouponPayload } from "../api/coupons";
import {
    parsePromotionList,
    parsePromotion,
    type Promotion,
} from "../schema/promotion.schema";

import {
    parseCouponList,
    parseCoupon,
    parseCouponRedemptions,
    type Coupon,
    type CouponRedemption,
} from "../schema/coupon.schema";

// ─── Promotion Queries ────────────────────────────────────

export async function fetchPromotions(params: PromotionListParams = {}): Promise<Promotion[]> {
    const response = await promotionsApi.getAll(params);
    return parsePromotionList(response);
}

export async function fetchPromotionById(id: number): Promise<Promotion> {
    const response = await promotionsApi.getById(id);
    return parsePromotion(response);
}

export async function createPromotion(data: PromotionPayload) {
    const response = await promotionsApi.create(data);
    return response;
}

export async function updatePromotion(id: number, data: Partial<PromotionPayload>) {
    const response = await promotionsApi.update(id, data);
    return response;
}

export async function deletePromotion(id: number) {
    const response = await promotionsApi.delete(id);
    return response;
}

export async function addPromotionTargets(id: number, data: PromotionTargetPayload) {
    const response = await promotionsApi.addTargets(id, data);
    return response;
}

export async function removePromotionTargets(id: number, data: PromotionTargetPayload) {
    const response = await promotionsApi.removeTargets(id, data);
    return response;
}

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
