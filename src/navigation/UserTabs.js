import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image } from "react-native";

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
import CategoryScreen from "../screens/user/CategoryScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ----------------- HOME STACK ----------------- */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Category" component={CategoryScreen} />

    </Stack.Navigator>
  );
}


function WishlistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="WishlistMain" component={Wishlist} />
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
      <Tab.Screen name="WishlistMain" component={WishlistStack} />
       <Stack.Screen name="Orders" component={Orders} />  
       <Stack.Screen name="ManageAddress" component={ManageAddress} />  
<Stack.Screen name="AddAddress" component={AddAddress} /> 
       
    </Stack.Navigator>
  );
}

/* ----------------- TABS ----------------- */
export default function UserTabs() {
  return (
      <Tab.Navigator
      initialRouteName="Home"
      
screenOptions={({ route }) => {
  const icons = {
    Home: require("../assets/icons/home.png"),
    WishlistMain: require("../assets/icons/wish-list.png"),
    Cart: require("../assets/icons/cart.png"),
    Profile: require("../assets/icons/profile.png"),
  };

  const tabLabels = {
    Home: "Home",
    WishlistMain: "Wishlist",
    Cart: "Cart",
    Profile: "Profile",
  };

  return {
    headerShown: false,
    tabBarShowLabel: true,
    tabBarActiveTintColor: "#111111", // ✅ fallback active color
    tabBarInactiveTintColor: "#8e8e8e", // ✅ fallback inactive color
    tabBarLabel: tabLabels[route.name],
    tabBarStyle: {
      position: "absolute",
      bottom: 2,
      left: 20,
      right: 20,
      height: 70,
      borderRadius: 20,
      backgroundColor: "#f9f4f4ff", // ✅ fallback tab background
      borderTopWidth: 0,
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    tabBarIcon: ({ focused }) => {
      const iconSource = icons[route.name];
      return (
        <Image
          source={iconSource}
          resizeMode="contain"
          style={{
            width: 32,
            height: 32,
            // tintColor: focused ? "#111111" : "#8e8e8e", // ✅ fallback tint
            opacity: focused ? 1 : 0.6,
          }}
        />
      );
    },
  }
}}

    >

      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="WishlistMain" component={WishlistStack} />

      {/* 🔥 Remove previous Cart here — use only this! */}
      <Tab.Screen name="Cart" component={CartStack} />

      <Tab.Screen name="Profile" component={ProfileStack} />

    </Tab.Navigator>
  );
}







