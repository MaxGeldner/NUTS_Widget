import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import Tracking from './screens/Tracking';
import History from './screens/History';
import Collection from './screens/Collection';

export default function App() {
  const Stack = createNativeStackNavigator();

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
