import React, {Component} from 'react';
import {View, Text, FlatList, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileScreen extends Component
{
	constructor(props){
		super(props);

    this.state = {
			isLoading: true,
			userData: []
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
			'headers': {
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
				isLoading: false,
				userData: responseJson
			})
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	loginCheck = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		console.log(token);
		if (token == null) {
			this.props.navigation.navigate('Login');
		}
		else{
			this.getData();
		}
	};
	
    logout = async () => {
        let token = await AsyncStorage.getItem('@session_token');
        await AsyncStorage.removeItem('@session_token');
		await AsyncStorage.removeItem('@user_id');
        return fetch("http://localhost:3333/api/1.0.0/logout", {
            method: 'post',
            headers: {
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
					<Text>{this.state.userData.first_name} {this.state.userData.last_name}</Text>
					<Button
						title="Log out"
						onPress={() => this.logout()}
					/>
				</View>
			);
		} 
	}
}



export default ProfileScreen;