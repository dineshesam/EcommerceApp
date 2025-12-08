import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* USER SCREENS */
import Home from "../screens/user/Home";
import Wishlist from "../screens/user/Wishlist";
import Cart from "../screens/user/Cart";
import Profile from "../screens/common/Profile";
import AddressScreen from "../screens/user/AddressScreen";
import ProductDetails from "../screens/user/ProductDetails";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ----------------- HOME STACK ----------------- */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
}

/* ----------------- PROFILE STACK ----------------- */
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="ProfileHome" component={Profile} />
      <Stack.Screen name="Address" component={AddressScreen} />
    </Stack.Navigator>
  );
}

/* ----------------- MAIN USER TABS ----------------- */
export default function UserTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown:false }}>
      
      <Tab.Screen name="Home" component={HomeStack} />

      <Tab.Screen name="Wishlist" component={Wishlist} />

      <Tab.Screen name="Cart" component={Cart} />

      {/* Correct: Stack inside Tab.Screen (not directly in navigator) */}
      <Tab.Screen name="Profile" component={ProfileStack} />

    </Tab.Navigator>
  );
}
