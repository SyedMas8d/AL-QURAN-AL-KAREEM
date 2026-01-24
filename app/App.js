import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SuraListScreen from './src/screens/SuraListScreen';
import SuraDetailScreen from './src/screens/SuraDetailScreen';
import { StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="SuraList"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#2E8B57',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen name="SuraList" component={SuraListScreen} options={{ title: 'Al-Quran Al-Kareem' }} />
                <Stack.Screen
                    name="SuraDetail"
                    component={SuraDetailScreen}
                    options={({ route }) => ({ title: String(route.params.sura.englishName) })}
                />
            </Stack.Navigator>
            <StatusBar style={String('light')} />
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});
