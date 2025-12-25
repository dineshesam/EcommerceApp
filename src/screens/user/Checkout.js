
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
import { useTranslation } from "react-i18next";

export default function Checkout({ navigation }) {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

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
      setCouponError(t("order.enterCouponCodePrompt"));
      return;
    }
    setCouponApplying(true);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      if (result?.valid) {
        setDiscount(result.discount);
      } else {
        setDiscount(0);
        setCouponError(result?.message || t("order.invalidCoupon"));
      }
    } catch (e) {
      setDiscount(0);
      setCouponError(e.message || t("order.couponValidationFailed"));
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
        setCouponsError(e.message || t("order.couponsLoadFailed"));
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
        setCouponError(result?.message || t("order.invalidCoupon"));
      }
    } catch (err) {
      setDiscount(0);
      setCouponError(err.message || t("order.couponValidationFailed"));
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
        <Text style={styles.qty}>
          {t("order.items")}: {item.qty}
        </Text>
      </View>
      <Text style={styles.price}>
        ₹ {(item.product.price * item.qty).toLocaleString("en-IN")}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.header}>{t("order.orderSummary")}</Text>

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
          <Text style={styles.totalText}>{t("order.subtotal")}:</Text>
          {discount > 0 && <Text style={styles.totalText}>{t("order.discount")}:</Text>}
          <Text style={styles.totalText}>{t("order.payable")}:</Text>
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
          <Text style={styles.sectionTitle}>{t("order.applyCoupon")}</Text>

          {/* Themed toggle button */}
          <TouchableOpacity
            onPress={toggleCoupons}
            activeOpacity={0.85}
            style={[
              styles.couponToggleBtn,
              showCoupons && styles.couponToggleBtnActive,
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: showCoupons }}
          >
            <Text style={styles.couponToggleBtnText}>
              {showCoupons ? t("order.hideCoupons") : t("order.showCoupons")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.couponRow}>
          <TextInput
            placeholder={t("order.enterCouponCode")}
            value={couponCode}
            onChangeText={(txt) => setCouponCode(txt.toUpperCase())}
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
              <Text style={styles.couponBtnText}>{t("shop.remove")}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.couponBtn,
                (couponApplying || !couponCode.trim()) && styles.couponBtnDisabled,
              ]}
              onPress={handleApplyCoupon}
              disabled={couponApplying || !couponCode.trim()}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.couponBtnText,
                  (couponApplying || !couponCode.trim()) && styles.couponBtnDisabledText,
                ]}
              >
                {couponApplying ? t("order.applying") : t("order.apply")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!!couponError && <Text style={styles.couponError}>{couponError}</Text>}

        {showCoupons && (
          <View style={{ marginTop: 8 }}>
            {couponsLoading && (
              <Text style={{ color: colors.secondaryText }}>
                {t("order.loadingCoupons")}
              </Text>
            )}
            {!!couponsError && (
              <Text style={{ color: colors.error }}>{couponsError}</Text>
            )}
            {!couponsLoading && !couponsError && availableCoupons.length === 0 && (
              <Text style={{ color: colors.secondaryText }}>
                {t("order.noAvailableCoupons")}
              </Text>
            )}
            {!couponsLoading &&
              availableCoupons.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.couponItem}
                  onPress={() => handlePickCoupon(c)}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontWeight: "700", color: colors.primaryText }}>
                    {c.code}
                  </Text>
                  <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
                    {c.type === "fixed"
                      ? t("order.couponFlat", { value: c.value })
                      : t("order.couponPercent", { value: c.value })}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>

      {/* ---- Proceed button ---- */}
      <TouchableOpacity
        style={[
          styles.orderBtn,
          (!cart.length || couponApplying) && styles.orderBtnDisabled,
        ]}
        onPress={() => navigation.navigate("PlaceOrder")}
        disabled={!cart.length || couponApplying}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.orderText,
            (!cart.length || couponApplying) && styles.orderBtnDisabledText,
          ]}
        >
          {t("order.proceedToPlaceOrder")} →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
function createStyles(colors) {
  return StyleSheet.create({
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

    // Primary coupon action button (Apply/Remove)
    couponBtn: {
      backgroundColor: colors.ctaButtonBg,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.brandAccent,
    },
    couponBtnText: { color: colors.ctaButtonText, fontWeight: "700" },
    couponBtnDisabled: {
      backgroundColor: colors.disabledButtonBg,
      borderColor: colors.border,
      elevation: 0,
      shadowOpacity: 0,
    },
    couponBtnDisabledText: {
      color: colors.disabledButtonText,
    },

    // List items inside coupon list
    couponItem: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    },

    // Themed toggle button for "Show/Hide Coupons"
    couponToggleBtn: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: colors.ctaButtonBg,
      borderColor: colors.brandAccent,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
      alignSelf: "flex-start",
    },
    couponToggleBtnText: {
      color: colors.ctaButtonText,
      fontWeight: "700",
      fontSize: 14,
    },
    couponToggleBtnActive: {
      backgroundColor: colors.ctaButtonBgPressed,
      borderColor: colors.brandAccentHover,
      elevation: 1,
      shadowOpacity: 0.08,
    },

    // Proceed button
    orderBtn: {
      marginTop: 20,
      backgroundColor: colors.ctaButtonBg,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    orderText: { color: colors.ctaButtonText, fontWeight: "800", fontSize: 15 },
    orderBtnDisabled: {
      backgroundColor: colors.disabledButtonBg,
    },
    orderBtnDisabledText: {
      color: colors.disabledButtonText,
    },
  });
}
