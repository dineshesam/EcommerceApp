import api from "./axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* GET full cart list */
export const fetchCartFromServer = async () => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.get("/cart", {
    headers:{ Authorization:`Bearer ${token}` }
  });
  return res.data;  // [{productId,qty,product:{...}}]
};

/* ADD or INCREASE qty */
export const addToCartServer = async (productId) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.post("/cart", { productId }, {
    headers:{ Authorization:`Bearer ${token}` }
  });
};

/* UPDATE quantity */
export const updateCartQtyServer = async (productId, qty) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.patch("/cart", { productId, qty },{
    headers:{ Authorization:`Bearer ${token}` }
  });
};

/* REMOVE ITEM completely */
export const removeFromCartServer = async (productId) => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.delete(`/cart/${productId}`,{
    headers:{ Authorization:`Bearer ${token}` }
  });
};

/* CLEAR ENTIRE CART */
export const clearCartServer = async () => {
  const token = await AsyncStorage.getItem("userToken");
  return await api.delete("/cart",{
    headers:{ Authorization:`Bearer ${token}` }
  });
};
