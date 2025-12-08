import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../screens/Login";
import UserTabs from "./UserTabs";
import AdminTabs from "./AdminTabs";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="UserTabs" component={UserTabs}/>
        <Stack.Screen name="AdminTabs" component={AdminTabs}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
