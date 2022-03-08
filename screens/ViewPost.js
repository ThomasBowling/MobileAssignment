import React, { Component } from 'react';
import { Text, View, StyleSheet, Button, Image} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ViewPostScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
			isLoading: true,
			postData: [],
        }
    }

	componentDidMount() {
		this.unsubscribe = this.props.navigation.addListener('focus', () => {
			this.getPost();
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	
	getPost = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		const post_id = await AsyncStorage.getItem('@post_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/post/" + post_id, {
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
				throw 'Unauthorised';
            }
			else{
                throw 'Error Occured';
            }
        })
        .then((responseJson) => {
			this.setState({
				postData: responseJson
			})
			this.getPhoto(this.state.postData.author.user_id);
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	getPhoto = async (photo_id) => {
		const token = await AsyncStorage.getItem('@session_token');
		return fetch("http://localhost:3333/api/1.0.0/user/" + photo_id + "/photo", {
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
			this.state.postData.user_photo = data;				
			this.setState({
				isLoading: false
			})
		})
		.catch((error) => {
			console.log(error)
		});
	}
	
	render(){
		if (this.state.isLoading){
			return(
				<View>
					<Text>Loading..</Text>
				</View>
			);
		}
		else{
			return(
				<View style = {styles.Container}>
					<View style = {styles.postView}>
						<View style={{flexDirection: 'row'}}>
							<Image source={{
							uri: this.state.postData.user_photo,
							}}
							style={{
								width: 50,
								height: 50,
							}}/>
							<View style = {{flex: 1, paddingLeft: '1%'}}>
								<Text style ={{fontSize: '14px',fontWeight: 'bold'}}>{this.state.postData.author.first_name} {this.state.postData.author.last_name}</Text>
								<Text>{this.state.postData.text}</Text>
								<Text>Likes: {this.state.postData.numLikes}</Text>
								<Text>{new Date(this.state.postData.timestamp).toUTCString()}</Text>
							</View>
						</View>
					</View>
				</View>
			)
		}
	};
}

export default ViewPostScreen 

const styles = StyleSheet.create({
	Container: {
		position: 'relative',
		margin:'3%',
		flex: '1'
	},
	
	TextInput: {
		fontSize: '14px',
		height: '10%',
		borderWidth: '2px',
		borderColor: '#000000',
	},
	
	postView: {
	backgroundColor: '#d3d3d3',
	},
});