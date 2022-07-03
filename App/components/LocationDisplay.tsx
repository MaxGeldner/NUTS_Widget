import { Text, StyleSheet, FlatList, View } from 'react-native';
import { NUTSLevelObject } from '../types/NUTS';

export default function LocationDisplay ({ location }: { location: NUTSLevelObject }) {
    const levelDescriptions: any = {
        0: 'Land',
        1: 'Bundesland',
        2: 'Regierungsbezirk',
        3: 'Landkreis'
    }

    const nutsDataToListData = (nutsData: NUTSLevelObject) => {
        const listData: any[] = []
        Object.entries(nutsData).forEach(([levelId, name]) => {
            listData.push({
                id: levelId,
                title: name
            })
        })
        return listData
    }

    const renderListItem = ({ item }: { item: any }) => (
        <View style={styles.item}><Text style={styles.locationTextDescriptor}>{levelDescriptions[item.id]}</Text><Text>{item.title}</Text></View>
    )

    return (
        <FlatList data={nutsDataToListData(location)} renderItem={renderListItem} keyExtractor={item => item.id} />
    )
}

const styles = StyleSheet.create({
    item: {
        padding: 10,
        margin: 10,
        textTransform: 'uppercase',
        backgroundColor: '#eee'
    },
    locationTextDescriptor: {
        fontVariant: ['small-caps'],
        fontWeight: '600',
        fontSize: 18
    }
  });