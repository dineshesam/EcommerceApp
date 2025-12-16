// utils/makeImageUrl.js
import { CDN_BASE } from "../api/axiosConfig"; // same file as axios instance

export default function makeImageUrl(relativeOrAbsolute) {
  if (!relativeOrAbsolute) return "";

  // Already absolute? return as-is
  if (/^https?:\/\//i.test(relativeOrAbsolute)) return relativeOrAbsolute;

  // Normalize leading slashes and join with CDN_BASE
  const normalized = String(relativeOrAbsolute).replace(/^\/+/, "");
   return `${CDN_BASE}/${normalized}`;
}
