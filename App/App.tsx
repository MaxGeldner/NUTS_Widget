import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, SafeAreaView, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  let location = 'No location found...'

  useEffect(() => {
    // TODO: This is the created event. I guess?
    // requestLocationPermissions();
  }, []);

  /*const requestLocationPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use location");
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }*/

  const handlePressLocate = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let locationResult = await Location.getCurrentPositionAsync({});
    location = `${locationResult.coords.latitude}|${locationResult.coords.longitude}`;
    Alert.alert(location);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Locate me!" onPress={handlePressLocate} />
      {/* TODO: Where is my reactivity? */}
      <Text>{location}</Text>
      <StatusBar style="auto" />
    </SafeAreaView>
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
