import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Splash from "../screens/Splash";
import Login from "../screens/Login";
import UserTabs from "./UserTabs";
import AdminTabs from "./AdminTabs";
import Register from "../screens/Register";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false }}>

        {/*  FIRST SCREEN ALWAYS SPLASH */}
        <Stack.Screen name="Splash" component={Splash} />

        {/* AUTH SCREEN */}
        <Stack.Screen name="Login" component={Login} />
         <Stack.Screen name="Register" component={Register} /> 

        {/* USER & ADMIN ROUTES */}
        <Stack.Screen name="UserTabs" component={UserTabs} />
        <Stack.Screen name="AdminTabs" component={AdminTabs} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
