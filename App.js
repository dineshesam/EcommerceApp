import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AppNavigator from "./src/navigation/AppNavigator";  // <-- index.js auto loads
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component'
])




export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />  {/* Works now */}
    </Provider>
  );
}
