import History from "./History";
import { Center, NativeBaseProvider, Progress } from "native-base";
import { Text, StyleSheet } from 'react-native';

export default function Collection ({ route }: { route: any }) {
    return (
        <NativeBaseProvider>
            <Progress style={styles.progressBar} value={route.params.items.length / route.params.toReach} mx="4" />
            <Center><Text>{route.params.items.length} von {route.params.toReach} Landkreise besucht</Text></Center>
            <History route={route} />
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    progressBar: {
        marginTop: 20
    }
})

