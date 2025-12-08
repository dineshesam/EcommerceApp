import api from "./axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* GET wishlist → returns REAL PRODUCT LIST directly */
export const fetchWishlistProducts = async () => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.get("/wishlist", {
    headers:{ Authorization: `Bearer ${token}` }
  });
  return res.data; // Already product objects []
};

export const addToWishlistServer = async (productId) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.post("/wishlist", { productId }, {
    headers:{ Authorization:`Bearer ${token}` }
  });
};

export const removeFromWishlistServer = async (productId) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.delete(`/wishlist/${productId}`, {
    headers:{ Authorization:`Bearer ${token}` }
  });
};
