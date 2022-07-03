import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Tracking from './screens/Tracking';
import History from './screens/History';
import Collection from './screens/Collection';

const Stack = createNativeStackNavigator();

export default function App () {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Tracking"
          component={Tracking}
          options={{ title: 'NUTS Tracking' }}
        />
        <Stack.Screen
          name="History"
          component={History}
          options={{ title: 'Letzte Besuche (24h)' }}
        />
        <Stack.Screen
          name="Collection"
          component={Collection}
          options={{ title: 'Besuchte Orte' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};