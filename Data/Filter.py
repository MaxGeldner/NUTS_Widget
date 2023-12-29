import json

def read_NUTS_data():
    f = open("NUTS_RG_01M_2021_4326.geojson", "r", encoding="utf8")
    json_content = json.load(f)

    NUTS_lvl_3 = dict()
    NUTS_lvl_3['type'] = "FeatureCollection"
    NUTS_lvl_3['features'] = [feature for feature in json_content['features'] if feature['properties']['CNTR_CODE'] == 'DE']

    with open('NUTS_ALL_DE.geojson', 'w') as outfile:
        json.dump(NUTS_lvl_3, outfile)


read_NUTS_data()