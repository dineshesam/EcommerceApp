
// api/couponApi.js
import api from "./axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Validate a coupon code against the current cart total.
 * Returns: { valid: boolean, discountAmount: number, message?: string, ... }
 */
export async function validateCoupon(code, cartTotal) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const res = await api.post(
      "/coupons/validate",
      { code, cartTotal },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      }
    );
    return res.data;
  } catch (err) {
    // Normalize error
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Coupon validation failed";
    throw new Error(message);
  }
}

/**
 * * List available coupons
 * Returns: Coupon[] (e.g., [{ code, description, discountType, value, expiresAt }])
 */
export async function listCoupons() {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const res = await api.get("/coupons", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load coupons";
    throw new Error(message);
  }
}