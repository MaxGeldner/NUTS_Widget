import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Button, StyleSheet, Text, SafeAreaView, NativeModules } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationObjectCoords } from 'expo-location';
import Geometry from './helper/Geometry';

const NUTS_DATA = require('./assets/NUTS_ALL_DE.json');

const group = 'group.mage';
const SharedStorage = NativeModules.SharedStorage;

type NUTSLevels = 0|1|2|3;
type NUTSData = {
  geometry: {
    type: string,
    coordinates: Array<Array<any>>
  },
  properties: {
    NUTS_ID: string,
    LEVL_CODE: NUTSLevels,
    CNTR_CODE: string,
    NAME_LATN: string,
    NUTS_NAME: string,
    FID: string
  }
};
type NUTSLevelObject = {
  0: any, // Country
  1: any, // State
  2: any, // Region
  3: any, // County
};

export default function App() {
  const TRACKING_TASK_NAME = 'location_tracking'
  let locationLevels: NUTSLevelObject = {
    0: '-',
    1: '-',
    2: '-',
    3: '-',
  };

  let [location, setLocation] = React.useState<NUTSLevelObject>(locationLevels);
  let [trackingCount, setTrackingCount] = React.useState(0);
  let [trackingStarted, setTrackingStarted] = React.useState(false);

  useEffect(() => {
    requestLocationPermissions();
    defineTrackingTask();
  }, []);

  const defineTrackingTask = () => {
    TaskManager.defineTask(TRACKING_TASK_NAME, ({ data, error }: { data: any, error: any }) => {
      const locations: Array<{coords: LocationObjectCoords}> = data.locations;
      if (error) {
        console.error(error);
        return;
      }
      const lat = locations[0]?.coords?.latitude;
      const lng = locations[0]?.coords?.longitude;

      let found: NUTSLevelObject = {
        0: false,
        1: false,
        2: false,
        3: false,
      };
      NUTS_DATA.features.forEach((feature: NUTSData) => {
        if (Object.values(found).every(lvl => lvl)) {
          return;
        }

        if (feature.geometry.type === 'Polygon') {
          const polygon = feature.geometry.coordinates[0].map((c: Array<number>) => ({ x: c[0], y: c[1] }));
          if (Geometry.pointInPolygon({ x: lng, y: lat }, polygon)) {
            locationLevels[feature.properties.LEVL_CODE] = feature.properties.NAME_LATN
            found[feature.properties.LEVL_CODE] = true;
            setLocation(locationLevels);
            return;
          }
        } else if (feature.geometry.type === 'MultiPolygon') {
          const multiPolygon = feature.geometry.coordinates.map((poly: Array<Array<Array<number>>>) => poly[0].map((c: Array<number>) => ({ x: c[1], y: c[0] })));
          if (Geometry.pointInMultiPolygon({ x: lat, y: lng }, multiPolygon)) {
            locationLevels[feature.properties.LEVL_CODE] = feature.properties.NAME_LATN
            found[feature.properties.LEVL_CODE] = true;
            setLocation(locationLevels);
            return;
          }
        }
      });

      SharedStorage.set(JSON.stringify({locationLevels}));
      setTrackingCount(trackingCount++)
     }
    );
  }

  const startTracking = async () => {
    await Location.startLocationUpdatesAsync(TRACKING_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      distanceInterval: 100
    });

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK_NAME);
    setTrackingStarted(hasStarted);
  };

  const requestLocationPermissions = async () => {
    let foregroundPerm = await Location.requestForegroundPermissionsAsync();
    let backgroundPerm = await Location.requestBackgroundPermissionsAsync();
    if (foregroundPerm.status != 'granted' && backgroundPerm.status !== 'granted') {
        console.log('Permission to access location was denied');
    } else {
        console.log('Permission to access location granted');
    }
  };

  const handlePressStartTracking = () => {
    startTracking();
  };

  const handlePressStopTracking = () => {
    setTrackingStarted(false);

    TaskManager.isTaskRegisteredAsync(TRACKING_TASK_NAME)
      .then((tracking) => {
        if (tracking) {
          Location.stopLocationUpdatesAsync(TRACKING_TASK_NAME);
        }
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      {
        trackingStarted ?
          <Button title="Stop tracking" onPress={handlePressStopTracking} />
          :
          <Button title="Start tracking" onPress={handlePressStartTracking} />
      }
      <Text>Land: {location[0]}</Text>
      <Text>Bundesland: {location[1]}</Text>
      <Text>Regierungsbezirk: {location[2]}</Text>
      <Text>Landkreis: {location[3]}</Text>
      <Text>Tracking Count: {trackingCount}</Text>
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
