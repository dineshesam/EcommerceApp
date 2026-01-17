
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
import EditProfile from "../screens/common/EditProfile";
import ChangePassword from "../screens/common/ChangePassord";
import { useTranslation } from "react-i18next";

/** Theme hook that gives { colors } */
import useDynamicStyles from "../hooks/useDynamicStyles";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
  

/* ----------------- HOME STACK ----------------- */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Category" component={CategoryScreen} />
    </Stack.Navigator>
  );
}

function WishlistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WishlistMain" component={Wishlist} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
}

/* ----------------- CART STACK ----------------- */
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={Cart} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="PlaceOrder" component={PlaceOrder} />
      <Stack.Screen name="SelectAddress" component={SelectAddress} />
      <Stack.Screen name="AddAddress" component={AddAddress} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccess} options={{
    headerShown: false,
    gestureEnabled: false, // iOS swipe back disabled
  }} />
      <Stack.Screen name="Orders" component={Orders} />
    </Stack.Navigator>
  );
}

/* ----------------- PROFILE STACK ----------------- */
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={Profile} />
      {/* <Stack.Screen name="Address" component={AddressScreen} /> */}
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="ManageAddress" component={ManageAddress} />
      <Stack.Screen name="AddAddress" component={AddAddress} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
}

/* ----------------- TABS ----------------- */
export default function UserTabs() {
  const { colors } = useDynamicStyles();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        const icons = {
          Home: require("../assets/icons/home.png"),
          Wishlist: require("../assets/icons/wish-list.png"),
          Cart: require("../assets/icons/cart.png"),
          Profile: require("../assets/icons/profile.png"),
        };

        const tabLabels = {
          Home:t("common.home"),
          Wishlist: t("common.wishlist"),
          Cart: t("common.cart"),
          Profile: t("common.profile"),
        };

        const iconSource = icons[route.name];

        return {
          headerShown: false,
          tabBarShowLabel: true,

          tabBarActiveTintColor: colors?.primaryText || "#111111",
          tabBarInactiveTintColor: colors?.secondaryText || "#8e8e8e",
          tabBarLabel: tabLabels[route.name],

          tabBarStyle: {
            position: "absolute",
            bottom: 2,
            left: 20,
            right: 20,
            height: 70,
            borderRadius: 20,
            backgroundColor: colors?.tabBackground || "#f9f4f4ff",
            borderTopWidth: 0,

            // iOS shadow
            shadowColor: colors?.shadow || "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            // Android
            elevation: 0,
          },

          tabBarIcon: ({ focused, color }) => (
            <Image
              source={iconSource}
              resizeMode="contain"
              style={{
                width: 28,
                height: 28,
                // tintColor: color,       // uses theme-provided active/inactive
                opacity: focused ? 1 : 0.7,
              }}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Wishlist" component={WishlistStack} />
      <Tab.Screen name="Cart" component={CartStack} />
           <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}