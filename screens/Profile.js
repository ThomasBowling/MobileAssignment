import React, {Component} from 'react';
import {View, Text, FlatList, Button, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileScreen extends Component
{
	constructor(props){
		super(props);

    this.state = {
			isLoading: true,
			userData: [],
			photo: ""
		}
	}

	componentDidMount() {
		this.unsubscribe = this.props.navigation.addListener('focus', () => {
			this.loginCheck();
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	
	getData = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		console.log(user_id);
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Authorization':  token
			}
		})
        .then((response) => {
            if(response.status === 200){
                return response.json()
            }
			else if(response.status === 401){
				this.props.navigation.navigate("Login");
            }
			else{
                throw 'Error Occured';
            }
        })
        .then((responseJson) => {
			this.setState({
				userData: responseJson
			})
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	getPhoto = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		console.log(user_id);
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/photo", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Authorization':  token
			}
		})
		.then((res) => {
			return res.blob();
		})
		.then((resBlob) => {
			let data = URL.createObjectURL(resBlob);
			this.setState({
				photo: data,
				isLoading: false
			});
		})
		.catch((error) => {
			console.log(error)
		});
	}
	
	loginCheck = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		console.log(token);
		if (token == null) {
			this.props.navigation.navigate('Login');
		}
		else{
			this.getData();
			this.getPhoto();
		}
	};
	
    logout = async () => {
        let token = await AsyncStorage.getItem('@session_token');
        await AsyncStorage.removeItem('@session_token');
		await AsyncStorage.removeItem('@user_id');
        return fetch("http://localhost:3333/api/1.0.0/logout", {
            method: 'POST',
            headers: {
				'Content-Type': 'application/json',
                "X-Authorization": token
            }
        })
        .then((response) => {
            if(response.status === 200){
                this.props.navigation.navigate("Login");
            }else if(response.status === 401){
                this.props.navigation.navigate("Login");
            }else{
                throw 'Something went wrong';
            }
        })
        .catch((error) => {
            console.log(error);
        })
    }
	
	render() {
		if (this.state.isLoading){
			return(
				<View>
					<Text>Loading..</Text>
				</View>
			);
		}
		else{
			return (
				<View>
					<View style={{flexDirection: "row"}}>
						<Image source={{
							uri: this.state.photo,
						}}
						style={{
							width: 50,
							height: 50,
						}}/>
						<View>
							<Text>{this.state.userData.first_name} {this.state.userData.last_name}</Text>
							<Text>Friend Count: </Text>
						</View>
					</View>
					
					<View style={{flexDirection: "row"}}>
						<View style = {{flex: 1}}>
							<Button
								title="Log out"
								onPress={() => this.logout()}
							/>
						</View>
						
						<View style = {{flex: 1}}>
							<Button
								title="Edit Profile"
								onPress={() => this.props.navigation.navigate('EditProfile')}
							/>
						</View>
					</View>
				</View>
			);
		} 
	}
}



export default ProfileScreen;