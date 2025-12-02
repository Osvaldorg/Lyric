import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ProjectListScreen from '../screens/ProjectListScreen';
import ProjectEditorScreen from '../screens/ProjectEditorScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={ProjectListScreen} />
            <Stack.Screen name="Editor" component={ProjectEditorScreen} />
        </Stack.Navigator>
    );
}
