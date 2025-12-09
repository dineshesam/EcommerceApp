import axios from "axios";

// <--- CHANGE BASE_URL TO YOUR RUNNING SERVER --->
export const BASE_URL = "http://192.168.18.140:4000/api";
// 192.168.18.140
// 192.168.18.70
//  192.168.1.2

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default api;
