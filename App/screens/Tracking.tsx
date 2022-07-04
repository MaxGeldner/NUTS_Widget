import React, { useEffect } from 'react';
import { NUTSLevelObject, NUTSVisitedItem, NUTSData, NUTSGeoJSON } from '../types/NUTS';

import { StyleSheet, Text, /* NativeModules, */ Dimensions } from 'react-native';
import LocationDisplay from '../components/LocationDisplay';
import TrackingButton from '../components/TrackingButton';
import { NativeBaseProvider, Center, Box, Button, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

import visitedStorage from '../storages/visitedStorage';

const NUTS_DATA: NUTSGeoJSON = require('../assets/NUTS_ALL_DE.json');

// const SharedStorage = NativeModules.SharedStorage;

/**
 * "Home" screen of the app. Tracking happens here. This screen will also manage the visitedStore and pass data from it to the other views if
 * the top navigation buttons are used for it.
 * TODO: Data fetch for other screens should probably happen in those screens. Current implementation doesn't really allow this.
 *  Also: Does this work with the store? Does the same instance have to be used or can we just import the store in those screens? --> Something for a refactor :)
 * @returns 
 */
export default function Tracking ({ navigation }: { navigation: any }) {
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
  let [trackingHistory, setTrackingHistory] = React.useState<NUTSVisitedItem[]>([]);
  let [trackingProgress, setTrackingProgress] = React.useState<NUTSVisitedItem[]>([]);
  let lastLocation: NUTSLevelObject = {
    0: '-',
    1: '-',
    2: '-',
    3: '-',
  };
  const totalLvl3Objects = NUTS_DATA.features.filter((item: NUTSData) => item.properties.LEVL_CODE === 3).length;

  useEffect(() => {
    onOpen();
  }, [])

  const onOpen = async () => {
    // Get initial data from store, that is displayed on the other screens
    const historyItems = await visitedStorage.getAllDataForKey('historyItem')
    const progressItems = await visitedStorage.getAllDataForKey('progressItem')
    setTrackingHistory(() => historyItems)
    setTrackingProgress(() => progressItems)
  }

  const onTrackStart = () => {
    setTrackingStarted(true);
  }

  const onTrack = (location: NUTSLevelObject) => {
    setLocation((prevLocation) => ({ ...prevLocation, ...location }));
    setTrackingCount((prevTrackingCount) => prevTrackingCount + 1);
    setTrackingTime(() => new Date());

    saveToProgressStorage(location);
    saveToHistoryStorage(location);

    // used to determine if we are at a new location. Store saving will not be triggered if not.
    lastLocation = JSON.parse(JSON.stringify(location));

    // SharedStorage.set(JSON.stringify({locationLevels}));
  }

  const onTrackStop = () => {
    setTrackingStarted(false);
  }

  /**
   * Save an item (location param) to the visistedStorage under the key 'progressItem'. ProgressItem is a list of visited locations in
   * chronological order. Only contains unique items. Always the item first seen will be added to the list (the first visit at the location).
   * @param location 
   */
  const saveToProgressStorage = async (location: NUTSLevelObject) => {
    const storageContent = await visitedStorage.getAllDataForKey('progressItem');
    const alreadyProgressed = storageContent.find(({ levels }: { levels: NUTSLevelObject }) => JSON.stringify(levels) === JSON.stringify(location));

    if (!alreadyProgressed) {
      const visistedAt = new Date().getTime();
      const vistied: NUTSVisitedItem = {
        time: visistedAt,
        levels: location
      };
      visitedStorage.save({
        key: 'progressItem',
        // TODO: probably not the best to use the timestamp as an id. But it will be sufficient for the current app implementation :)
        id: `${visistedAt}`,
        data: vistied,
        expires: null,
      });

      const storageContent = await visitedStorage.getAllDataForKey('progressItem');
      setTrackingProgress(() => storageContent)
    }
  }

  /**
   * Saves an item (location param) to the visistedStorage under the key 'historyItem'. HistoryItem storage is a list of visited locations in
   * chronological order. Items can be in the list multiple times, but never twice in a row, except if entries don't stem from the same tracking task.
   * TODO: Do we really need two distinct storage keys? This will lead to data duplication. In theory we could use one list and
   *  filter it differently depending on the screen (History or Collection).
   * @param location
   */
  const saveToHistoryStorage = async (location: NUTSLevelObject) => {
    if(JSON.stringify(location) !== JSON.stringify(lastLocation)) {
      const visistedAt = new Date().getTime();
      const vistied: NUTSVisitedItem = {
        time: visistedAt,
        levels: location
      };
      visitedStorage.save({
        key: 'historyItem',
        id: `${visistedAt}`,
        data: vistied,
        expires: 1000 * 3600 * 24
      });

      const history = await visitedStorage.getAllDataForKey('historyItem')
      setTrackingHistory(() => history)
    }
  }

  return (
    <NativeBaseProvider>
      <Box safeArea style={styles.container}>
        <Center style={styles.heading}><Text style={styles.headingText}>Wo bin ich?</Text></Center>
        <Center style={styles.trackingButton}>
          <TrackingButton onTrackStart={onTrackStart} onTrack={onTrack} onTrackStop={onTrackStop} nutsData={NUTS_DATA} />
          <Button leftIcon={<Icon as={FontAwesome} name="history" size="sm" />} onPress={() => navigation.navigate('History', { items: trackingHistory })} colorScheme="muted">Verlauf</Button>
          <Button leftIcon={<Icon as={Ionicons} name="list" size="sm" />} onPress={() => navigation.navigate('Collection', { items: trackingProgress, toReach: totalLvl3Objects })} colorScheme="muted">Sammlung</Button>
        </Center>
        <Center>
          <LocationDisplay location={location} />
        </Center>
        <Center>
          <Text style={styles.trackingCount}>Letzte Abfrage: {trackingCount ? trackingTime.toLocaleTimeString('de-DE') : '-'}</Text>
        </Center>
      </Box>
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
    marginBottom: '10%'
  },
  headingText: {
    fontSize: 32,
    fontWeight: '900'
  },
  trackingButton: {
    width: '90%',
    padding: 10,
    borderRadius: 5,
    marginLeft: 'auto',
    marginRight: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#ddddff',
  },
  trackingCount: {
    marginTop: 20,
    fontVariant: ['tabular-nums'],
    fontWeight: '300',
  }
});
