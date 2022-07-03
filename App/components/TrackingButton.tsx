import React from 'react';
import { Button, Icon } from 'native-base';

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationObjectCoords } from 'expo-location';
import { NUTSData, NUTSLevelObject, NUTSGeoJSON } from '../types/NUTS';
import { FontAwesome } from '@expo/vector-icons';

import Geometry from '../helper/Geometry';

/**
 * Renders the start/stop tracking button depending on the current tracking state. Also contains logic for starting and stoping tracking, which is called
 * via the handler functions for the start/stop button.
 * @param obj.onTrackStart Function that will be executed when tracking started successfuly
 * @param obj.onTrackStop Function that will be executed when tracking stopped successfuly
 * @param obj.onTrack Function that will be executed everytime a tracking was done. Will have the location (NUTSLevelObject) as parameter
 * @param obj.nutsData The data basis for the tracking.
 * @returns 
 */
export default function TrackingButton ({ onTrackStart, onTrackStop, onTrack, nutsData }: { onTrackStart: Function, onTrackStop: Function, onTrack: Function, nutsData: NUTSGeoJSON }) {
    const TRACKING_TASK_NAME = 'location_tracking'
    let locationLevels: NUTSLevelObject = {
      0: '-',
      1: '-',
      2: '-',
      3: '-',
    };

    let [trackingStarted, setTrackingStarted] = React.useState(false);

    const requestLocationPermissions = async () => {
        let foregroundPerm = await Location.requestForegroundPermissionsAsync();
        let backgroundPerm = await Location.requestBackgroundPermissionsAsync();
        if (foregroundPerm.status != 'granted' && backgroundPerm.status !== 'granted') {
            console.log('Permission to access location was denied');
        } else {
            console.log('Permission to access location granted');
        }
    };
  
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
        nutsData.features.forEach((feature: NUTSData) => {
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

        onTrack(locationLevels);
       }
      );
    }
  
    const startTracking = async () => {
      await requestLocationPermissions();

      defineTrackingTask();
  
      await Location.startLocationUpdatesAsync(TRACKING_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 10000,
        showsBackgroundLocationIndicator: true,
        deferredUpdatesInterval: 100
      });
  
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK_NAME);
      hasStarted && onTrackStart();
      setTrackingStarted(hasStarted);
    };

    const stopTracking = () => {
        TaskManager.isTaskRegisteredAsync(TRACKING_TASK_NAME)
        .then((tracking) => {
          if (tracking) {
            Location.stopLocationUpdatesAsync(TRACKING_TASK_NAME);
            onTrackStop();
            setTrackingStarted(false);
          }
        });
    }
  
    const handlePressStartTracking = () => {
      startTracking();
    };
  
    const handlePressStopTracking = () => {
      stopTracking();
    };

    return trackingStarted ? 
        <Button leftIcon={<Icon as={FontAwesome} name="pause" size="sm" />} onPress={handlePressStopTracking} colorScheme="red">Tracking</Button>
        : <Button leftIcon={<Icon as={FontAwesome} name="play" size="sm" />} onPress={handlePressStartTracking} colorScheme="green">Tracking</Button>
}