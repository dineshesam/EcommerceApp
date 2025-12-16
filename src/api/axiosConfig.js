import axios from "axios";

// <--- CHANGE BASE_URL TO YOUR RUNNING SERVER --->
export const BASE_URL = "http://192.168.1.20:4000/api";
// 192.168.18.140  4th floor
// 192.168.18.70 FF
//  192.168.1.2  ikea 158
// 192.168.1.20
// http://10.0.2.2:3001

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default api;
