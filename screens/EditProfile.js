import React, { Component } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EditProfileScreen extends Component{
    constructor(props){
        super(props);

        this.state = {
			first_name: "",
			last_name: "",
            email: "",
            password: "",
			errorEmail: "",
			errorPass: ""
        }
    }

    updateaccount = async () => {
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
				first_name: this.state.first_name,
				last_name: this.state.last_name,
				email: this.state.email,
				password: this.state.password
			}
			
			const token = await AsyncStorage.getItem('@session_token');
			const user_id = await AsyncStorage.getItem('@user_id');
			return fetch("http://localhost:3333/api/1.0.0/user/" + user_id, {
				method: 'PATCH',
				headers: {
					'X-Authorization':  token,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(this.data)
			})
			.then((response) => {
				if(response.status === 200){
					return 'OK';
				}else if(response.status === 400){
					throw 'Bad Request';
				}else if(response.status === 401){
					throw 'Unauthorised';				
				}else{
					throw 'Something went wrong';
				}
			})
			.then(async (responseJson) => {
					this.props.navigation.navigate("ProfileStack");
			})
			.catch((error) => {
				console.log(error);
			})
		}
    }

    render(){
        return (
			<View style = {styles.Container}>
				
				<Text style = {styles.InputTitle}>First Name</Text>
				<TextInput style = {styles.TextInput}
					placeholder="Enter first name"
					onChangeText={(first_name) => this.setState({first_name})}
					value={this.state.first_name}
				/>
				<Text style = {styles.Error}>{this.state.errorFirst}</Text>
				
				<Text style = {styles.InputTitle}>Last Name</Text>
				<TextInput style = {styles.TextInput}
					placeholder="Enter last name"
					onChangeText={(last_name) => this.setState({last_name})}
					value={this.state.last_name}
				/>
				<Text style = {styles.Error}>{this.state.errorLast}</Text>
				
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
					title="Update Account"
					color="#383837"
					onPress={() => this.updateaccount()}
				/>
			</View>
        )
    }
}

export default EditProfileScreen;

const styles = StyleSheet.create({
	Container: {
		position: 'relative',
		top:'35%',
		left:'35%',
		width: '30%',
	},
	
	TextInput: {
		fontSize: '16px',
	},
});