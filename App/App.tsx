import React from 'react';
import { NUTSLevelObject } from './types/NUTS';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, /* NativeModules, */ Dimensions } from 'react-native';
import LocationDisplay from './components/LocationDisplay';
import TrackingButton from './components/TrackingButton';
import { NativeBaseProvider, Center, Box } from "native-base";

const NUTS_DATA = require('./assets/NUTS_ALL_DE.json');

// const SharedStorage = NativeModules.SharedStorage;

export default function App() {
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

  const onTrackStart = () => {
    setTrackingStarted(true);
  }

  const onTrack = (location: NUTSLevelObject) => {
    setLocation((prevLocation) => ({ ...prevLocation, ...location }));
    setTrackingCount((prevTrackingCount) => prevTrackingCount + 1);
    setTrackingTime(() => new Date());

    // SharedStorage.set(JSON.stringify({locationLevels}));
  }

  const onTrackStop = () => {
    setTrackingStarted(false);
  }

  return (
    <NativeBaseProvider>
      <Box safeArea style={styles.container}>
        <Center style={styles.heading}><Text style={styles.headingText}>Wo bin ich?</Text></Center>
        <Center style={styles.trackingButton}>
          <TrackingButton onTrackStart={onTrackStart} onTrack={onTrack} onTrackStop={onTrackStop} nutsData={NUTS_DATA} />
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
