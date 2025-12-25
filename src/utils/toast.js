
// src/utils/toast.js
import Toast from 'react-native-toast-message';

const base = {
  position: 'bottom',
  bottomOffset: 80,     // fixed ~20px from bottom
  visibilityTime: 1600, // shorter for compact pill
  autoHide: true,
};

// Optional: prevent stacking (show only one at a time)
let lastTimer;
const showSingle = (payload) => {
  if (lastTimer) {
    clearTimeout(lastTimer);
    lastTimer = null;
  }
  Toast.hide(); // hide any existing toast immediately
  // Small delay to ensure previous unmount completes before mounting the next
  setTimeout(() => Toast.show(payload), 50);
  // Set a timer to clear reference when it auto hides
  lastTimer = setTimeout(() => {
    lastTimer = null;
  }, (payload.visibilityTime ?? base.visibilityTime) + 200);
};

export const showToast = (type, text1, text2, overrides = {}) => {
  const payload = { type, text1, text2, ...base, ...overrides };
  showSingle(payload);
};

export const toastSuccess = (title, desc, o) => showToast('success', title, desc, o);
export const toastError   = (title, desc, o) => showToast('error', title, desc, o);
export const toastInfo    = (title, desc, o) => showToast('info', title, desc, o);

export const hideToast = () => Toast.hide();
