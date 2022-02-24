import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';

import ProfileScreen from './screens/Profile';
import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';

const Drawer = createDrawerNavigator();

class App extends Component{
    render(){
        return (
            <NavigationContainer>
                <Drawer.Navigator initialRouteName="Profile">
					<Drawer.Screen name="Profile" component={ProfileScreen} />
                    <Drawer.Screen name="Login" component={LoginScreen} />
					<Drawer.Screen name="Signup" component={SignupScreen} />
                </Drawer.Navigator>
                
            </NavigationContainer>
        );
    }
}

export default App;