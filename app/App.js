import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import SuraListScreen from './src/screens/SuraListScreen';
import SuraDetailScreen from './src/screens/SuraDetailScreen';
import SignificantListScreen from './src/screens/SignificantListScreen';
import SignificantDetailScreen from './src/screens/SignificantDetailScreen';
import SeekingKnowledgeListScreen from './src/screens/SeekingKnowledgeListScreen';
import VideoDetailScreen from './src/screens/VideoDetailScreen';
import { StyleSheet, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator for Quran Tab
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
            <Stack.Screen name="SuraList" component={SuraListScreen} options={{ title: 'அல் குர்ஆன் அல் கரீம்' }} />
            <Stack.Screen
                name="SuraDetail"
                component={SuraDetailScreen}
                options={({ route }) => ({ title: String(route.params.sura.tamilName) })}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Significant Tab
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
                options={{ title: 'முக்கியமானவை' }}
            />
            <Stack.Screen
                name="SignificantDetail"
                component={SignificantDetailScreen}
                options={({ route }) => ({ title: route.params?.item?.title || 'விவரங்கள்' })}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator for Seeking Knowledge Tab
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
                options={{ title: 'கல்வியைத் தேடுதல்' }}
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
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#2E8B57',
                    tabBarInactiveTintColor: '#666',
                    tabBarStyle: {
                        backgroundColor: '#fff',
                        borderTopWidth: 2,
                        borderTopColor: '#2E8B57',
                        paddingTop: 8,
                        paddingBottom: 8,
                        height: 75,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 13,
                        fontWeight: 'bold',
                        marginTop: 4,
                        marginBottom: 4,
                    },
                    tabBarIconStyle: {
                        marginTop: 4,
                    },
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="QuranTab"
                    component={QuranStack}
                    options={{
                        tabBarLabel: 'குர்ஆன்',
                        tabBarIcon: ({ color, focused }) => (
                            <Text style={{ fontSize: focused ? 32 : 28, color }}>📖</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="SignificantTab"
                    component={SignificantStack}
                    options={{
                        tabBarLabel: 'முக்கியமானவை',
                        tabBarIcon: ({ color, focused }) => (
                            <Text style={{ fontSize: focused ? 32 : 28, color }}>⭐</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="KnowledgeTab"
                    component={KnowledgeStack}
                    options={{
                        tabBarLabel: 'கல்வி',
                        tabBarIcon: ({ color, focused }) => (
                            <Text style={{ fontSize: focused ? 32 : 28, color }}>🎓</Text>
                        ),
                    }}
                />
            </Tab.Navigator>
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
