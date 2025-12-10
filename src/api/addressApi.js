import api from "./axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getMyAddresses = async () => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.get("/addresses/my", {
    headers:{ Authorization:`Bearer ${token}` }
  });
  console.log("➡ Response:", res.data);
  return res.data;
};

export const addAddress = async (data) => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.post("/addresses", data, {
    headers:{ Authorization:`Bearer ${token}` }
  });
  return res.data;
};

export const updateAddress = async (id, data) => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.patch(`/addresses/${id}`, data,{
    headers:{ Authorization:`Bearer ${token}` }
  });
  return res.data;
};

export const removeAddress = async (id) => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await api.delete(`/addresses/${id}`,{
    headers:{ Authorization:`Bearer ${token}` }
  });
  return res.data;
};
