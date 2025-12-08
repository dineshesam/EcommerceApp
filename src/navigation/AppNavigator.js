import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/Splash';
import AuthNavigator from './AuthNavigator';
import UserTabNavigator from './UserTabNavigator';
import AdminStackNavigator from './AdminStackNavigator';
import { storage } from '../utils/storage';

const Root = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('Splash');
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await storage.getUser();
      setUser(saved);
      setInitialRoute('Splash');
    })();
  }, []);

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Root.Screen name="Splash" component={Splash} />
        <Root.Screen name="Auth" component={AuthNavigator} />
        <Root.Screen name="User" component={UserTabNavigator} />
        <Root.Screen name="Admin" component={AdminStackNavigator} />
      </Root.Navigator>
    </NavigationContainer>
  );
}
