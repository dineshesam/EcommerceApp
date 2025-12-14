
// api/couponApi.js
const BASE_URL = 'http://192.168.18.70:4000'; // change if needed

export async function validateCoupon(code, cartTotal) {
  const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, cartTotal }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Coupon validation failed');
  }
  return res.json();
}

export async function listCoupons() {
  const res = await fetch(`${BASE_URL}/api/coupons`);
  if (!res.ok) throw new Error('Failed to load coupons');
  return res.json();
}
