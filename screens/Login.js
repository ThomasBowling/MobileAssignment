import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LoginScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
            email: "",
            password: "",
			errorText:"",
			errorEmail: "",
			errorPass: ""
        }
    }
	
	
    login = async () => {
		let errorBool = false;
		//Regex Expression from https://www.w3resource.com/javascript/form/email-validation.php
		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email))){
			this.setState({ errorEmail: "Email is invalid"});
			errorBool = true;
		}
		else{
			this.setState({ errorEmail: ""});
		}
		
		if(this.state.password.length < 6){
			this.setState({ errorPass: "Password must be greater then 5 characters"});
			errorBool = true;
		}
		else{
			this.setState({ errorPass: ""});
		}
		if(!errorBool){
			
			this.data = {
				email: this.state.email,
				password: this.state.password
			}
			
			return fetch("http://localhost:3333/api/1.0.0/login", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.data)
			})
			.then((response) => {
				if(response.status === 200){
					return response.json()
				}else if(response.status === 400){
					this.setState({ errorText: "Incorrect email or password"});
					throw 'Invalid email or password';
				}else{
					throw 'Something went wrong';
				}
			})
			.then(async (responseJson) => {
					console.log(responseJson);
					await AsyncStorage.setItem('@session_token', responseJson.token);
					await AsyncStorage.setItem('@user_id', responseJson.id);
					this.props.navigation.navigate("ProfileStart");
			})
			.catch((error) => {
				console.log(error);
			})
		}
    }

    render(){
        return (
            <View style = {styles.Container}>
			
				<Text style = {styles.InputTitle}>Email</Text>
				<TextInput style = {styles.TextInput}
					placeholder="Enter email"
					onChangeText={(email) => this.setState({email})}
					value={this.state.email}
				/>
				<Text style = {styles.Error}>{this.state.errorEmail}</Text>
				
				<Text style = {styles.InputTitle}>Password</Text>
				<TextInput style = {styles.TextInput}
					placeholder="Enter password"
					onChangeText={(password) => this.setState({password})}
					value={this.state.password}
					secureTextEntry
				/>
				<Text style = {styles.Error}>{this.state.errorPass}</Text>
				
				<Button
					titleStyle={{fontSize: '10px'}}
					title="Login"
					color="#383837"
					onPress={() => this.login()}
				/>
				
				<View style = {{margin: '3%'}}></View>
						
				<Button
					title="Sign Up"
					color="#383837"
					onPress={() => this.props.navigation.navigate("Signup")}
				/>
				<Text style = {styles.Error}>{this.state.errorText}</Text>
            </View>
        )
    }
}

export default LoginScreen;

const styles = StyleSheet.create({
	Container: {
		position: 'relative',
		top:'35%',
		left:'35%',
		width: '35%',
	},
	
	TextInput: {
		fontSize: '14px',
	},
	InputTitle: {
		fontSize: '14px',
		fontWeight: 'bold',
	},
	Error: {
		fontSize: '14px',
		color: 'red',
	},
});