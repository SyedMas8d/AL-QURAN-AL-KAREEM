import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import SuraListScreen from './src/screens/SuraListScreen';
import SuraDetailScreen from './src/screens/SuraDetailScreen';
import SignificantListScreen from './src/screens/SignificantListScreen';
import SignificantDetailScreen from './src/screens/SignificantDetailScreen';
import SeekingKnowledgeListScreen from './src/screens/SeekingKnowledgeListScreen';
import VideoDetailScreen from './src/screens/VideoDetailScreen';
import VideoListScreen from './src/screens/VideoListScreen';
import AdhkarListScreen from './src/screens/AdhkarListScreen';
import AsSalahListScreen from './src/screens/AsSalahListScreen';
import AsSalahDetailScreen from './src/screens/AsSalahDetailScreen';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Stack Navigator for Quran
function QuranStack() {
    return (
        <Stack.Navigator
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
            <Stack.Screen
                name="SuraList"
                component={SuraListScreen}
                options={{
                    title: 'அல் குர்ஆன் அல் கரீம்',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="SuraDetail"
                component={SuraDetailScreen}
                options={({ route }) => ({ title: String(route.params.sura.tamilName) })}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Learn to Read Quran (20 days)
function LearnQuranStack() {
    return (
        <Stack.Navigator
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
            <Stack.Screen
                name="VideoList"
                component={VideoListScreen}
                initialParams={{ categoryKey: 'learn_to_read_quran' }}
                options={{
                    title: 'குர்ஆனை வாசிக்க கற்றுக்கொள்வோம்',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="VideoDetail"
                component={VideoDetailScreen}
                options={({ route }) => ({
                    title: route.params?.categoryTitle || 'Video',
                })}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Morning & Evening Adhkar
function AdhkarStack() {
    return (
        <Stack.Navigator
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
            <Stack.Screen
                name="AdhkarList"
                component={AdhkarListScreen}
                options={{
                    title: 'காலை & மாலை திக்ருகள்',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="VideoDetail"
                component={VideoDetailScreen}
                options={({ route }) => ({
                    title: route.params?.categoryTitle || 'Video',
                })}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Significant
function SignificantStack() {
    return (
        <Stack.Navigator
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
            <Stack.Screen
                name="SignificantList"
                component={SignificantListScreen}
                options={{
                    title: 'முக்கியமானவை',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="SignificantDetail"
                component={SignificantDetailScreen}
                options={({ route }) => ({ title: route.params?.item?.title || 'விவரங்கள்' })}
            />
            <Stack.Screen
                name="VideoDetail"
                component={VideoDetailScreen}
                options={({ route }) => ({
                    title: route.params?.categoryTitle || 'Video',
                })}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Prayer
function PrayerStack() {
    return (
        <Stack.Navigator
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
            <Stack.Screen
                name="AsSalahList"
                component={AsSalahListScreen}
                options={{
                    title: 'தொழுகை வழிகாட்டி',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="AsSalahDetail"
                component={AsSalahDetailScreen}
                options={({ route }) => ({ title: route.params?.section?.title || 'விவரங்கள்' })}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Seeking Knowledge
function KnowledgeStack() {
    return (
        <Stack.Navigator
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
            <Stack.Screen
                name="KnowledgeList"
                component={SeekingKnowledgeListScreen}
                options={{
                    title: 'கல்வியைத் தேடுதல்',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="VideoDetail"
                component={VideoDetailScreen}
                options={({ route }) => ({
                    title: route.params?.categoryTitle || 'Video',
                })}
            />
        </Stack.Navigator>
    );
}

export default function App() {
    console.log('App rendering...');

    return (
        <NavigationContainer>
            <Drawer.Navigator
                screenOptions={{
                    drawerStyle: {
                        backgroundColor: '#f8f9fa',
                        width: 280,
                    },
                    drawerActiveTintColor: '#2E8B57',
                    drawerInactiveTintColor: '#666',
                    drawerLabelStyle: {
                        fontSize: 15,
                        fontWeight: '600',
                        marginLeft: -16,
                    },
                    drawerItemStyle: {
                        borderRadius: 8,
                        marginVertical: 2,
                    },
                    drawerActiveBackgroundColor: '#e8f5e9',
                    headerStyle: {
                        backgroundColor: '#2E8B57',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Drawer.Screen
                    name="Quran"
                    component={QuranStack}
                    options={{
                        title: 'அல் குர்ஆன்',
                        drawerIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📖</Text>,
                    }}
                />
                <Drawer.Screen
                    name="LearnQuran"
                    component={LearnQuranStack}
                    options={{
                        title: 'குர்ஆனை வாசிக்க கற்றுக்கொள்வோம். (20 நாட்களில்)',
                        drawerIcon: ({ color }) => <Ionicons name="book" size={22} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="Adhkar"
                    component={AdhkarStack}
                    options={{
                        title: 'காலை & மாலை திக்ருகள்',
                        drawerIcon: ({ color }) => <Ionicons name="sunny" size={22} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="Significant"
                    component={SignificantStack}
                    options={{
                        title: 'முக்கியமான ஸூராக்கள் & வசனங்கள்',
                        drawerIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⭐</Text>,
                    }}
                />
                <Drawer.Screen
                    name="Prayer"
                    component={PrayerStack}
                    options={{
                        title: 'தொழுகை வழிகாட்டி',
                        drawerIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🕌</Text>,
                    }}
                />
                <Drawer.Screen
                    name="Knowledge"
                    component={KnowledgeStack}
                    options={{
                        title: 'கல்வியைத் தேடுதல்',
                        drawerIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎓</Text>,
                    }}
                />
            </Drawer.Navigator>
            <StatusBar style="light" />
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
