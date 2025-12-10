import api from "./axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** PLACE ORDER **/
export const createOrder = async (payload) => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.post("/orders", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

/** FETCH MY ORDERS **/
export const getMyOrders = async () => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.get("/orders/my", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
