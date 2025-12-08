import api from "./axiosConfig";

export const loginApi = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data; // returns token + user
  } catch (err) {
    throw err.response ? err.response.data : { msg: "Network error" };
  }
};
