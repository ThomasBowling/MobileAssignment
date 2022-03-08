import React, {Component} from 'react';
import {View, Text, FlatList, Button, Image, StyleSheet} from 'react-native';
import { ScrollView, TextInput} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FriendProfileScreen extends Component
{
	constructor(props){
		super(props);

    this.state = {
			userData: [],
			postData: [],
			postText: "",
			viewingID: "",
		}
	}

	componentDidMount() {
		this.unsubscribe = this.props.navigation.addListener('focus', () => {
			this.getData();
			this.getPosts();
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	
	getData = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const viewing_id = await AsyncStorage.getItem('@user_id');
		const user_id = await AsyncStorage.getItem('@friend_user_id');
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
				userData: responseJson,
				viewingID: viewing_id
			})
			this.getPhoto(this.state.userData.user_id, 0, "Profile");
			console.log(this.state.userData);
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	getPhoto = async (photo_id, index, type) => {
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
			if(type == "Profile")
			{
				this.state.userData.user_photo = data;				
			}
			else if(type == "Post")
			{
				this.state.postData[index].user_photo = data;				
			}
			this.setState(this.state);
		})
		.catch((error) => {
			console.log(error)
		});
	}
	getPosts = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@friend_user_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/post", {
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
			for(var entry in this.state.postData)
			{
				this.getPhoto(this.state.postData[entry].author.user_id, entry, "Post")
			}	
			console.log(responseJson);
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	sendPost = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@friend_user_id');
		this.data = {
			text: this.state.postText
		}
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/post", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization':  token
				},
				body: JSON.stringify(this.data)
			})
			.then((response) => {
				if(response.status === 201){
					return response.json()
				}else if(response.status === 401){
					throw 'Unauthorised';
				}else if(response.status === 404){
					throw 'Not Found';
				}else{
					throw 'Something went wrong';
				}
			})
			.then(async (responseJson) => {
					this.getPosts();
					this.setState({
						postText: "",
					})
			})
			.catch((error) => {
				console.log(error);
			})
	}
	
	deletePost = async (post_id) => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@friend_user_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/post/" + post_id, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization':  token
				},
			})
			.then((response) => {
				if(response.status === 200){
					this.getPosts();
				}else if(response.status === 401){
					throw 'Unauthorised';
				}else if(response.status === 403){
					throw 'Forbidden- can only delete own posts';
				}else if(response.status === 404){
					throw 'Not Found';
				}else{
					throw 'Something went wrong';
				}
			})
			.catch((error) => {
				console.log(error);
			})
	}
	
	likePost = async (post_id, postUser_id) => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@friend_user_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/post/" + post_id + "/like", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization':  token
				},
			})
			.then((response) => {
				if(response.status === 200){
					this.getPosts();
				}else if(response.status === 401){
					throw 'Unauthorised';
				}else if(response.status === 403){
					if(postUser_id == user_id)
					{
						throw 'Forbidden- Cant like Posts on your own page';
					}
					else
					{
						throw 'Forbidden- You have already liked this post';
					}
				}else if(response.status === 404){
					throw 'Not Found';
				}else{
					throw 'Something went wrong';
				}
			})
			.catch((error) => {
				console.log(error);
			})
	}
	
	unlikePost = async (post_id) => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@friend_user_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/post/" + post_id + "/like", {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization':  token
				},
			})
			.then((response) => {
				if(response.status === 200){
					this.getPosts();
				}else if(response.status === 401){
					throw 'Unauthorised';
				}else if(response.status === 403){
					throw 'Forbidden- you have not liked this post';
				}else if(response.status === 404){
					throw 'Not Found';
				}else{
					throw 'Something went wrong';
				}
			})
			.catch((error) => {
				console.log(error);
			})
	}
	
	editPost = async(post_id) => {
		await AsyncStorage.setItem('@post_id', post_id);
		this.props.navigation.navigate('Edit Friends Post')
	}
	
	viewPost = async(post_id) => {
		await AsyncStorage.setItem('@post_id', post_id);
		this.props.navigation.navigate('View Friends Post')
	}
	
	render() {
		return (
			<View style = {styles.Container}>
				<View style={{flexDirection: 'row'}}>
					<Image source={{
						uri: this.state.userData.user_photo,
					}}
					style={{
						width: 100,
						height: 100,
					}}/>
					<View style={{left:'3%'}}>
						<Text style = {styles.ProfileText}>{this.state.userData.first_name} {this.state.userData.last_name}</Text>
						<Text style = {styles.ProfileText}>Friend Count: {this.state.userData.friend_count}</Text>
					</View>
				</View>
				
				<Text style = {styles.ProfileText}>Posts:</Text>
				
				<TextInput style = {styles.TextInput}
					placeholder="Enter Post Text"
					textAlignVertical = 'top'
					multiline = 'true'
					onChangeText={(postText) => this.setState({postText})}
					value={this.state.postText}
				/>
				
				<View style = {{margin: '1%'}}></View>
				
				<Button
					title="Send Post"
					color="#383837"
					onPress={() => this.sendPost()}
				/>
				
				<View style = {{margin: '1%'}}></View>
				
				<ScrollView>
					{ this.state.postData.map((data) => {
						return(
							<View key={data.post_id}>
								<View style = {styles.postView}>
									<View style={{flexDirection: 'row'}}>
										<Image source={{
										uri: data.user_photo,
										}}
										style={{
											width: 50,
											height: 50,
										}}/>
										<View style = {{flex: 1, paddingLeft: '1%'}}>
											<Text style ={{fontSize: '14px',fontWeight: 'bold'}}>{data.author.first_name} {data.author.last_name}</Text>
											<Text>{data.text}</Text>
											<Text>Likes: {data.numLikes}</Text>
											<Text>{new Date(data.timestamp).toUTCString()}</Text>
										</View>
									</View>
									{(data.author.user_id == this.state.viewingID) ? (
										<View style={{flexDirection: 'row'}}>
											<View style = {{flex: 20}}>
												<Button
													title="Delete"
													color="#383837"
													onPress={() => this.deletePost(data.post_id)}
												/>
											</View>
											<View style = {{flex: 1}}></View>
											<View style={{flex: 20}}>
												<Button
													title="Update"
													color="#383837"
													onPress={() => this.editPost(data.post_id)}
												/>
											</View>
										</View>
									) : (
										<View style={{flexDirection: 'row'}}>
											<View style = {{flex: 4, alignSelf: 'center'}}>
												<Button
													title="View Post"
													color="#383837"
													onPress={() => this.viewPost(data.post_id)}
												/>
											</View>
											
											<View style = {{flex: 1}}></View>
											
											<View style = {{flex: 2, alignSelf: 'center'}}>
												<Button
													title="Like"
													color="#383837"
													onPress={() => this.likePost(data.post_id, data.author.user_id)}
												/>
											</View>
											
											<View style = {{flex: 1}}></View>

											<View style = {{flex: 2, alignSelf: 'center'}}>
												<Button
													title="Unlike"
													color="#383837"
													onPress={() => this.unlikePost(data.post_id)}
												/>
											</View>
											
											<View style = {{flex: 1}}></View>
										</View>
									)}
								</View>
								<View style = {{margin: '1%', backgroundColor: '#ffffff'}}></View>
							</View>
							)
						})}
				</ScrollView>
			</View>
		);
	}
}



export default FriendProfileScreen;

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
	
	ProfileText: {
		fontSize: '20px',
		fontWeight: 'bold',
		marginTop: '1%',
	},
	
	postView: {
		backgroundColor: '#d3d3d3',
	},
});