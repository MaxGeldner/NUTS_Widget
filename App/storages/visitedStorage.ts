import Storage from 'react-native-storage';
// TODO: deprecated, but other AsyncStorage lead to errors with expo???
import { AsyncStorage } from 'react-native';

const visitedStorage = new Storage({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true,
});

export default visitedStorage;