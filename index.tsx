import { Text, View, Platform, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bars3CenterLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';

const ios = Platform.OS == 'ios';

export default function Index() {
    return (
        <View style={styles.container}>
            {/* Search bar and logo */}
            <SafeAreaView style={ios ? styles.safeAreaIOS : styles.safeAreaAndroid}>
                <StatusBar style="light" />
                <View style={styles.header}>
                    <Bars3CenterLeftIcon size={35} strokeWidth={2} color="white" />
                    <Text style={styles.Headertext}>Jamboree</Text>
                    <TouchableOpacity>
                        <MagnifyingGlassIcon size={35} strokewidth={2} color={'white'}/>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F2937',
    },
    safeAreaIOS: {
        marginBottom: -2,
    },
    safeAreaAndroid: {
        marginBottom: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: -45, // Adjust the top margin if needed
    },
    Headertext: {
        color: 'white',
        fontSize: 32, // Increase font size for larger text
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1, // This ensures that the text is centered horizontally
    },
});
