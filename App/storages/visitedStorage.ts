import Storage from 'react-native-storage';
// TODO: deprecated, but other AsyncStorage lead to errors with expo???
import { AsyncStorage } from 'react-native';

const visitedStorage = new Storage({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true,
  sync: {
    historyItem(params: any) {
      // TODO: This is kinda hacky, I think. This function is called when item was not found in the storage or was expired. We want to clean up those items.
      //  Is there another way to do this? Normally this function is for other purposes :) Also this doesn't really work well, because at first the item is
      //  returned. It is removed after returning, meaning item will only be deleted after next store load.
      visitedStorage.remove({
        key: 'historyItem',
        id: `${params.id}`
      });
    }
  }
});

export default visitedStorage;