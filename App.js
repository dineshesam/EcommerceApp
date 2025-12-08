import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AppNavigator from "./src/navigation";  // <-- index.js auto loads

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />  {/* Works now */}
    </Provider>
  );
}
