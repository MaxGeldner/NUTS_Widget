import React from 'react';
import { useEffect } from 'react';

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationObjectCoords } from 'expo-location';
import { NUTSData, NUTSLevelObject } from './types/NUTS';

import Geometry from './helper/Geometry';

import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, /* NativeModules, */ Dimensions } from 'react-native';
import LocationDisplay from './components/LocationDisplay';
import { NativeBaseProvider, Center, Box } from "native-base";

const NUTS_DATA = require('./assets/NUTS_ALL_DE.json');

// const SharedStorage = NativeModules.SharedStorage;

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
  let [trackingTime, setTrackingTime] = React.useState(new Date());
  let [trackingStarted, setTrackingStarted] = React.useState(false);

  useEffect(() => {
    onAppStart();
  }, []);

  const onAppStart = async () => {
    await requestLocationPermissions();
  }

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
            return;
          }
        } else if (feature.geometry.type === 'MultiPolygon') {
          const multiPolygon = feature.geometry.coordinates.map((poly: Array<Array<Array<number>>>) => poly[0].map((c: Array<number>) => ({ x: c[1], y: c[0] })));
          if (Geometry.pointInMultiPolygon({ x: lat, y: lng }, multiPolygon)) {
            locationLevels[feature.properties.LEVL_CODE] = feature.properties.NAME_LATN
            found[feature.properties.LEVL_CODE] = true;
            return;
          }
        }
      });

      setLocation((prevLocation) => ({ ...prevLocation, ...locationLevels }));
      setTrackingCount((prevTrackingCount) => prevTrackingCount + 1);
      setTrackingTime(() => new Date());

      // SharedStorage.set(JSON.stringify({locationLevels}));
     }
    );
  }

  const startTracking = async () => {
    defineTrackingTask();

    await Location.startLocationUpdatesAsync(TRACKING_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 10000,
      showsBackgroundLocationIndicator: true,
      deferredUpdatesInterval: 100
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
    <NativeBaseProvider>
      <Box safeArea style={styles.container}>
        <Center style={styles.heading}><Text style={styles.headingText}>Wo bin ich?</Text></Center>
        <Center style={styles.trackingButton}>
          {
          trackingStarted ?
            <Button title="Tracking stoppen" onPress={handlePressStopTracking} color="#ff000099" />
            :
            <Button title="Tracking starten" onPress={handlePressStartTracking} color="#0000ff99" />
          }
        </Center>
        <Center>
          <LocationDisplay location={location} />
        </Center>
        <Center>
          <Text style={styles.trackingCount}>Letzte Abfrage: {trackingCount ? trackingTime.toLocaleTimeString('de-DE') : '-'}</Text>
        </Center>
      </Box>
      <StatusBar style="auto" />
      {(trackingStarted && trackingCount === 0) && <Center style={[styles.loadingIndicator, {transform: [{ translateX: -Dimensions.get('window').width * 0.3 }]}]} width='60%' height='10%'><Text>Standort wird gesucht...</Text></Center>}
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eeeeee22',
    height: '100%',
  },
  loadingIndicator: {
    top: '50%',
    left: '50%',
    position: 'absolute',
    backgroundColor: '#dddddddd'
  },
  heading: {
    marginTop: '10%',
    marginBottom: '30%'
  },
  headingText: {
    fontSize: 32,
    fontWeight: '900'
  },
  trackingButton: {
    marginBottom: 20,
  },
  trackingCount: {
    marginTop: 20,
    fontVariant: ['tabular-nums'],
    fontWeight: '300',
  }
});
