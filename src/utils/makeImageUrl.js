const BASE_URL = "http://192.168.18.70:4000"; // your backend IP

export default function makeImageUrl(relativeOrAbsolute) {
  if (!relativeOrAbsolute) return "";

  // If already an absolute URL → return as is
  if (/^https?:\/\//i.test(relativeOrAbsolute)) return relativeOrAbsolute;

  // Convert "/uploads/p1.jpg" → "http://ip:4000/uploads/p1.jpg"
  return `${BASE_URL}/${relativeOrAbsolute.replace(/^\/+/, "")}`;
}
