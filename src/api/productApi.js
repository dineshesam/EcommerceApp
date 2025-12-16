import api from "./axiosConfig";

export const getAllProducts = async (page = 1, limit = 48) => {
  const res = await api.get(`/products?page=${page}&limit=${limit}`);
  return res.data; // returns {items,total,page,limit}
};

