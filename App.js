import React, { Component } from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';

import ProfileScreen from './screens/Profile';
import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import FriendsScreen from './screens/Friends';
import EditProfileScreen from './screens/EditProfile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProfileTabs() {
	return (
		<Tab.Navigator screenOptions={{ headerShown: false }}>
			<Tab.Screen name="ProfileTab" component ={ProfileStacks} options={{ title: 'Profile' }}/>
			<Tab.Screen name="FriendsTab" component={FriendsStacks} options={{ title: 'Friends' }}/>
		</Tab.Navigator>
	);
}

function ProfileStacks() {
	return (
		<Stack.Navigator>
			<Stack.Screen name="ProfileStack" component ={ProfileScreen} options={{ title: 'Profile' }}/>
			<Stack.Screen name="EditProfile" component={EditProfileScreen} />
		</Stack.Navigator>
	);
}

function FriendsStacks() {
	return (
		<Stack.Navigator>
			<Stack.Screen name="FriendsStack" component ={FriendsScreen} options={{ title: 'Friends' }}/>
		</Stack.Navigator>
	);
}

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="ProfileStart"  screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="Signup" component={SignupScreen} />
				<Stack.Screen name="ProfileStart" component={ProfileTabs} />
			</Stack.Navigator>   
		</NavigationContainer>
	);
}