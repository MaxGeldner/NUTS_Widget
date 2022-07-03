import { Text, StyleSheet, FlatList, View } from 'react-native';
import { NUTSVisitedItem, NUTSLevelObject } from '../types/NUTS';

export default function History ({ route }: { route: any }) {
    const nutsDataToListData = (visistedItems: NUTSVisitedItem[]) => {
        const listData: any[] = []
        visistedItems.forEach(({time, levels}: { time: number, levels: NUTSLevelObject }) => {
            listData.push({
                time,
                title: `${levels[1]}: ${levels[3]}`
            })
        })
        return listData.reverse()
    }

    const renderListItem = ({ item }: { item: any }) => (
        <View style={styles.item}>
            <Text style={styles.itemDate}>{new Date(item.time).toLocaleDateString('de-DE')} {new Date(item.time).toLocaleTimeString('de-DE')}</Text>
            <Text>{item.title}</Text>
        </View>
    )

    return (
        <FlatList data={nutsDataToListData(route.params.items)} renderItem={renderListItem} keyExtractor={item => item.time} />
    )
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#ddddff',
        margin: 10,
        padding: 5
    },
    itemDate: {
        fontSize: 16,
        fontWeight: '900',
        borderBottomColor: '#444444',
        borderBottomWidth: 1
    },
});