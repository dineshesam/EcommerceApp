import api from "./axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** GET USER CART **/
export const fetchCartFromServer = async () => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.get("/cart", {
    headers:{ Authorization:`Bearer ${token}` }
  });
  return res.data; // [{ productId, qty, product:{...} }]
};

/** ADD TO CART **/
export const addToCartServer = async (productId) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.post("/cart", { productId }, {
    headers:{ Authorization:`Bearer ${token}` }
  });
};

/** UPDATE QTY **/
export const updateCartQtyServer = async (productId, qty) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.patch("/cart", { productId, qty }, {
    headers:{ Authorization:`Bearer ${token}` }
  });
};

/** 🔥 DELETE SINGLE PRODUCT **/
export const removeFromCartServer = async (productId) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.delete(`/cart/${productId}`, {
    headers:{ Authorization:`Bearer ${token}` }
  });
};

/** CLEAR CART (OPTIONAL) **/
export const clearCartServer = async () => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.delete("/cart", {
    headers:{ Authorization:`Bearer ${token}` }
  });
};
