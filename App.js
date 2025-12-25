
// App.js
import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AppNavigator from "./src/navigation/AppNavigator";  // <-- index.js auto loads
import { LogBox } from "react-native";
import './src/i18n/i18n';

import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/CustomToast';

LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component'
]);

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
      {/* Toast must be mounted near the root to be globally available */}
      <Toast config={toastConfig} />
    </Provider>
  );
}
