import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* USER SCREENS */
import Home from "../screens/user/Home";
import Wishlist from "../screens/user/Wishlist";
import Cart from "../screens/user/Cart";
import Checkout from "../screens/user/Checkout";
import Profile from "../screens/common/Profile";
import AddressScreen from "../screens/user/AddressScreen";
import ProductDetails from "../screens/user/ProductDetails";
import PlaceOrder from "../screens/user/PlaceOrder";
import OrderSuccess from "../screens/user/OrderSuccess";
import Orders from "../screens/user/Orders";
import SelectAddress from "../screens/user/SelectAddress";
import AddAddress from "../screens/user/AddAddress";
import ManageAddress from "../screens/user/ManageAddress";

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

/* ----------------- CART STACK ----------------- */
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="CartMain" component={Cart} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="PlaceOrder" component={PlaceOrder} />
      <Stack.Screen name="SelectAddress" component={SelectAddress} /> 
      <Stack.Screen name="AddAddress" component={AddAddress} /> 
    <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
    <Stack.Screen name="Orders" component={Orders} /> 
    </Stack.Navigator>
  );
}

/* ----------------- PROFILE STACK ----------------- */
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="ProfileHome" component={Profile} />
      {/* <Stack.Screen name="Address" component={AddressScreen} /> */}
       <Stack.Screen name="Orders" component={Orders} />  
       <Stack.Screen name="ManageAddress" component={ManageAddress} />  
<Stack.Screen name="AddAddress" component={AddAddress} /> 
       
    </Stack.Navigator>
  );
}

/* ----------------- TABS ----------------- */
export default function UserTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown:false }}>

      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Wishlist" component={Wishlist} />

      {/* 🔥 Remove previous Cart here — use only this! */}
      <Tab.Screen name="Cart" component={CartStack} />

      <Tab.Screen name="Profile" component={ProfileStack} />

    </Tab.Navigator>
  );
}
