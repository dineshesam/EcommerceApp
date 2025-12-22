
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import makeImageUrl from "../../utils/makeImageUrl";
import { validateCoupon, listCoupons } from "../../api/couponApi";
import { useDispatch, useSelector } from "react-redux";
import { setCheckoutTotals } from "../../redux/slices/checkoutSlice";
import useDynamicStyles from "../../hooks/useDynamicStyles";

export default function Checkout({ navigation }) {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  // Subtotal (without coupon)
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );

  /* ---------- Coupon state ---------- */
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Toggle + list available coupons
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState("");

  // ✅ Compute final total on the fly (no payableTotal state)
  const finalTotal = useMemo(
    () => Math.max(0, subtotal - (discount || 0)),
    [subtotal, discount]
  );

  // Keep checkout totals in Redux (for later steps)
  useEffect(() => {
    dispatch(
      setCheckoutTotals({
        couponCode,
        subtotal,
        discount,
        finalTotal,
      })
    );
  }, [dispatch, couponCode, subtotal, discount, finalTotal]);

  // Clamp discount if subtotal shrinks
  useEffect(() => {
    if (discount > subtotal) {
      setDiscount(subtotal);
    }
  }, [subtotal, discount]);

  /* ---------- Handlers ---------- */
  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponApplying(true);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      if (result?.valid) {
        setDiscount(result.discount);
      } else {
        setDiscount(0);
        setCouponError(result?.message || "Invalid coupon");
      }
    } catch (e) {
      setDiscount(0);
      setCouponError(e.message || "Coupon validation failed");
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setCouponError("");
  };

  const toggleCoupons = async () => {
    setCouponsError("");
    if (!showCoupons) {
      try {
        setCouponsLoading(true);
        const list = await listCoupons();
        setAvailableCoupons(Array.isArray(list) ? list : []);
      } catch (e) {
        setCouponsError(e.message || "Could not load coupons");
      } finally {
        setCouponsLoading(false);
      }
    }
    setShowCoupons((prev) => !prev);
  };

  const handlePickCoupon = async (c) => {
    setCouponCode(c.code);
    setShowCoupons(false);
    setCouponError("");
    setCouponApplying(true);
    try {
      const result = await validateCoupon(c.code, subtotal);
      if (result?.valid) {
        setDiscount(result.discount);
      } else {
        setDiscount(0);
        setCouponError(result?.message || "Invalid coupon");
      }
    } catch (err) {
      setDiscount(0);
      setCouponError(err.message || "Coupon validation failed");
    } finally {
      setCouponApplying(false);
    }
  };

  /* ---------- List render ---------- */
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: makeImageUrl(item.product.images?.[0]) }}
        style={styles.img}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.qty}>Qty: {item.qty}</Text>
      </View>
      <Text style={styles.price}>
        ₹ {(item.product.price * item.qty).toLocaleString("en-IN")}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.header}>Order Summary</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) =>
          item.productId?.toString() || item.product.id.toString()
        }
        renderItem={renderItem}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      {/* ---- Totals box (Subtotal/Discount/Payable) ---- */}
      <View style={styles.totalBox}>
        <View>
          <Text style={styles.totalText}>Subtotal:</Text>
          {discount > 0 && <Text style={styles.totalText}>Discount:</Text>}
          <Text style={styles.totalText}>Payable:</Text>
        </View>
        <View>
          <Text style={styles.totalAmount}>
            ₹ {subtotal.toLocaleString("en-IN")}
          </Text>
          {discount > 0 && (
            <Text style={[styles.totalAmount, { color: colors.error }]}>
              - ₹ {discount.toLocaleString("en-IN")}
            </Text>
          )}
          <Text style={[styles.totalAmount, { color: colors.priceText }]}>
            ₹ {finalTotal.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* ---- Coupon Section ---- */}
      <View style={styles.couponBox}>
        <View style={styles.couponHeaderRow}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          <TouchableOpacity onPress={toggleCoupons} activeOpacity={0.85}>
            <Text style={styles.linkText}>
              {showCoupons ? "Hide Coupons" : "Show Coupons"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.couponRow}>
          <TextInput
            placeholder="Enter coupon code"
            value={couponCode}
            onChangeText={(t) => setCouponCode(t.toUpperCase())}
            autoCapitalize="characters"
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholderTextColor={colors.inputPlaceholder}
          />
          {discount > 0 ? (
            <TouchableOpacity
              style={[styles.couponBtn, { backgroundColor: colors.error }]}
              onPress={handleRemoveCoupon}
              activeOpacity={0.85}
            >
              <Text style={styles.couponBtnText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.couponBtn}
              onPress={handleApplyCoupon}
              disabled={couponApplying || !couponCode.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.couponBtnText}>
                {couponApplying ? "Applying..." : "Apply"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!!couponError && <Text style={styles.couponError}>{couponError}</Text>}

        {showCoupons && (
          <View style={{ marginTop: 8 }}>
            {couponsLoading && <Text style={{ color: colors.secondaryText }}>Loading coupons...</Text>}
            {!!couponsError && (
              <Text style={{ color: colors.error }}>{couponsError}</Text>
            )}
            {!couponsLoading &&
              !couponsError &&
              availableCoupons.length === 0 && (
                <Text style={{ color: colors.secondaryText }}>No available coupons</Text>
              )}
            {!couponsLoading &&
              availableCoupons.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.couponItem}
                  onPress={() => handlePickCoupon(c)}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontWeight: "700", color: colors.primaryText }}>{c.code}</Text>
                  <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
                    {c.type === "fixed" ? `Flat ₹${c.value}` : `${c.value}% off`}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>

      {/* ---- Proceed button ---- */}
      <TouchableOpacity
        style={styles.orderBtn}
        onPress={() => navigation.navigate("PlaceOrder")}
        disabled={!cart.length || couponApplying}
        activeOpacity={0.85}
      >
        <Text style={styles.orderText}>Proceed to Place Order →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg, padding: 12 },
    header: { fontSize: 20, fontWeight: "700", marginBottom: 10, color: colors.primaryText },

    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    },
    img: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
    name: { fontSize: 15, fontWeight: "600", color: colors.primaryText },
    qty: { fontSize: 13, color: colors.secondaryText },
    price: { fontSize: 15, fontWeight: "800", color: colors.priceText },

    totalBox: {
      marginTop: 10,
      padding: 10,
      backgroundColor: colors.card,
      borderRadius: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    totalText: { fontSize: 15, fontWeight: "600", color: colors.primaryText },
    totalAmount: { fontSize: 17, fontWeight: "800", color: colors.primaryText },

    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.primaryText },

    couponBox: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.sectionBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    couponHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    couponRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },

    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.primaryText,
      fontSize: 15,
    },

    couponBtn: {
      backgroundColor: colors.ctaButtonBg,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
    },
    couponBtnText: { color: colors.ctaButtonText, fontWeight: "700" },
    couponError: { color: colors.error, marginTop: 6 },

    couponItem: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    },

    orderBtn: {
      marginTop: 20,
      backgroundColor: colors.ctaButtonBg,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    orderText: { color: colors.ctaButtonText, fontWeight: "800", fontSize: 15 },
  });
