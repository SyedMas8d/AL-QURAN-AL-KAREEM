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
import AdhkarTimeDetailScreen from './src/screens/AdhkarTimeDetailScreen';
import AdhkarDetailScreen from './src/screens/AdhkarDetailScreen';
import AsSalahListScreen from './src/screens/AsSalahListScreen';
import AsSalahDetailScreen from './src/screens/AsSalahDetailScreen';
import DailyDuasListScreen from './src/screens/DailyDuasListScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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
                options={({ navigation }) => ({
                    title: 'காலை & மாலை திக்ருகள்',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="AdhkarTimeDetail"
                component={AdhkarTimeDetailScreen}
                options={{
                    title: 'காலை & மாலை திக்ருகள்',
                }}
            />
            <Stack.Screen
                name="AdhkarDetail"
                component={AdhkarDetailScreen}
                options={({ route }) => ({
                    title: route.params?.title || 'துஆ',
                })}
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
                options={({ navigation }) => ({
                    title: 'முக்கியமான ஸூராக்கள் & வசனங்கள்',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                })}
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
                options={({ navigation }) => ({
                    title: 'தொழுகை வழிகாட்டி',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="AsSalahDetail"
                component={AsSalahDetailScreen}
                options={{
                    title: 'தொழுகை வழிகாட்டி',
                }}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Daily Duas
function DailyDuasStack() {
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
                name="DailyDuasList"
                component={DailyDuasListScreen}
                options={({ navigation }) => ({
                    title: 'தினசரி துஆக்கள்',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                })}
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

// Stack Navigator for Report Issue
function ReportIssueStack() {
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
                name="ReportIssue"
                component={ReportIssueScreen}
                options={{
                    title: 'தவறுகளை சுட்டிக்காட்டு',
                    headerShown: false,
                }}
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
                        width: 300,
                    },
                    drawerActiveTintColor: '#2E8B57',
                    drawerInactiveTintColor: '#666',
                    drawerLabelStyle: {
                        fontSize: 14,
                        fontWeight: '600',
                        marginLeft: -8,
                        flexWrap: 'wrap',
                        flex: 1,
                    },
                    drawerItemStyle: {
                        borderRadius: 8,
                        marginVertical: 4,
                        marginHorizontal: 12,
                        paddingVertical: 4,
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
                        drawerIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="LearnQuran"
                    component={LearnQuranStack}
                    options={{
                        title: 'குர்ஆனை வாசிக்க கற்றுக்கொள்வோம். (20 நாட்களில்)',
                        drawerIcon: ({ color }) => <Ionicons name="school" size={24} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="Adhkar"
                    component={AdhkarStack}
                    options={{
                        title: 'காலை & மாலை திக்ருகள்',
                        drawerIcon: ({ color }) => <Ionicons name="sunny" size={24} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="Significant"
                    component={SignificantStack}
                    options={{
                        title: 'முக்கியமான ஸூராக்கள் & வசனங்கள்',
                        drawerIcon: ({ color }) => <Ionicons name="star" size={24} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="Prayer"
                    component={PrayerStack}
                    options={{
                        title: 'தொழுகை வழிகாட்டி',
                        drawerIcon: ({ color }) => <Ionicons name="moon" size={24} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="DailyDuas"
                    component={DailyDuasStack}
                    options={{
                        title: 'தினசரி துஆக்கள்',
                        drawerIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
                        headerShown: false,
                    }}
                />
                <Drawer.Screen
                    name="Knowledge"
                    component={KnowledgeStack}
                    options={{
                        title: 'கல்வியைத் தேடுதல்',
                        drawerIcon: ({ color }) => <Ionicons name="bulb" size={24} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="ReportIssueNav"
                    component={ReportIssueStack}
                    options={{
                        title: 'தவறுகளை சுட்டிக்காட்டு',
                        drawerIcon: ({ color }) => <Ionicons name="alert-circle" size={24} color={color} />,
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
