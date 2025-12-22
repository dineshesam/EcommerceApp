
import axios from "axios";

// API origin with /api (for JSON endpoints)
export const API_BASE = "http://192.168.1.20:4000/api";
// 192.168.18.140  4th floor
// 192.168.18.70 FF
//  192.168.1.2  ikea 158
// 192.168.1.20
// http://10.0.2.2:3001

// Derive a CDN/IMAGE base (strip trailing /api if present)
export const CDN_BASE = API_BASE.replace(/\/api\/?$/, "");

// Single axios instance for all API calls
const api = axios.create({
  baseURL: API_BASE,
   timeout: 10000,
});


export default api;
