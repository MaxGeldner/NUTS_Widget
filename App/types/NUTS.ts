export type NUTSLevels = 0|1|2|3;
export type NUTSData = {
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
export type NUTSLevelObject = {
  0: any, // Country
  1: any, // State
  2: any, // Region
  3: any, // County
};