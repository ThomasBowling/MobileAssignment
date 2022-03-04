import React, { Component } from 'react';
import { Text, View, StyleSheet, Button} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EditPostScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
			isLoading: true,
			oldPost: [],
			newText: "",
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
				oldPost: responseJson,
				isLoading: false
			})
        })
        .catch((error) => {
            console.log(error);
        })
	}
		
	editPost = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		const post_id = await AsyncStorage.getItem('@post_id');
		const time = parseInt(Date.now()/1000);
		this.data = {
			text: this.state.newText,
			timestamp: time
		}
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/post/" + post_id, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization':  token
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
				}else if(response.status === 403){
					throw 'Forbidden- can only edit own posts';
				}else if(response.status === 404){
					throw 'Not Found';						
				}else{
					throw 'Something went wrong';
				}
			})
			.then(async (responseJson) => {
					console.log(this.data);
					this.props.navigation.navigate("ProfileStack");
			})
			.catch((error) => {
				console.log(error);
			})
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
						<Text style ={{fontSize: '14px',fontWeight: 'bold'}}>{this.state.oldPost.author.first_name} {this.state.oldPost.author.last_name}</Text>
						<Text>{this.state.oldPost.text}</Text>
						<Text>Likes: {this.state.oldPost.numLikes}</Text>
						<Text>{new Date(this.state.oldPost.timestamp).toUTCString()}</Text>
					</View>
					
					<View style = {{margin: '3%'}}></View>
					
					<TextInput style = {styles.TextInput}
						placeholder = {this.state.oldPost.text}
						textAlignVertical = 'top'
						multiline = 'true'
						onChangeText={(newText) => this.setState({newText})}
						value={this.state.postText}
					/>
					
					<View style = {{margin: '3%'}}></View>
					
					<Button
						title="Edit Post"
						color="#383837"
						onPress={() => this.editPost()}
					/>
				</View>
			)
		}
	};
}

export default EditPostScreen 

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