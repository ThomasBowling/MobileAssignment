/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import 'react-native-gesture-handler';

import ProfileScreen from './screens/Profile';
import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import FriendsScreen from './screens/Friends';
import EditProfileScreen from './screens/EditProfile';
import CameraScreen from './screens/CameraScreen';
import EditPostScreen from './screens/EditPost';
import ViewPostScreen from './screens/ViewPost';
import EditFriendsPostScreen from './screens/EditFriendPost';
import ViewFriendsPostScreen from './screens/ViewFriendPost';
import FriendsProfileScreen from './screens/FriendProfile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProfileStacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileStack" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Edit Profile" component={EditProfileScreen} />
      <Stack.Screen name="Camera Screen" component={CameraScreen} />
      <Stack.Screen name="Edit Post" component={EditPostScreen} />
      <Stack.Screen name="View Post" component={ViewPostScreen} />
    </Stack.Navigator>
  );
}

function FriendsStacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FriendsStack" component={FriendsScreen} options={{ title: 'Friends' }} />
      <Stack.Screen name="View Friends Profile" component={FriendsProfileScreen} />
      <Stack.Screen name="Edit Friends Post" component={EditFriendsPostScreen} />
      <Stack.Screen name="View Friends Post" component={ViewFriendsPostScreen} />
    </Stack.Navigator>
  );
}

function ProfileTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStacks}
        options={{
          title: 'Profile',
          unmountOnBlur: true,
          tabBarIcon: () => (
            <FontAwesome name="user" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="FriendsTab"
        component={FriendsStacks}
        options={{
          title: 'Friends',
          unmountOnBlur: true,
          tabBarIcon: () => (
            <FontAwesome5 name="user-friends" size={24} color="black" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ProfileStart" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileStart" component={ProfileTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
