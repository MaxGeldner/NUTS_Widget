export type NUTSLevels = 0|1|2|3;
export type NUTSGeoJSON = {
  features: Array<NUTSData>
};
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
  0: string|boolean, // Country
  1: string|boolean, // State
  2: string|boolean, // Region
  3: string|boolean, // County
};
export type NUTSVisitedItem = {
  time: number,
  levels: NUTSLevelObject
};