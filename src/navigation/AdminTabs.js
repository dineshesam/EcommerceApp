import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AdminDashboard from "../screens/admin/AdminDashboard";
import ManageProducts from "../screens/admin/ManageProducts";
import Profile from "../screens/common/Profile";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown:false }}>
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Products" component={ManageProducts} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
