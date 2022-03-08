import React, {Component} from 'react';
import {View, Text, FlatList, Button, Image, StyleSheet} from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FriendScreen extends Component
{
	constructor(props){
		super(props);

    this.state = {
			friendsData: [],
			friendRequestData: [],
			searchFriends: "",
			searchData: [],
		}
	}

	componentDidMount() {
		this.unsubscribe = this.props.navigation.addListener('focus', () => {
			this.getFriends();
			this.getFriendRequests();
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getFriends = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/friends", {
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
				friendsData: responseJson
			})
			for(var entry in this.state.friendsData)
			{
				this.getPhoto(this.state.friendsData[entry].user_id, entry, "friend")
			}				
			console.log(responseJson);
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	addFriend = async (friend_id) => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + friend_id + "/friends", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Authorization':  token
			}
		})
        .then((response) => {
            if(response.status === 201){
                console.log("Request sent")
            }
			else if(response.status === 401){
				throw 'Unauthorised';
            }
			else if(response.status === 403){
				throw 'User already friend/ Request Submitted';
            }
			else if(response.status === 404){
				throw 'Not Found';
            }
			else{
                throw 'Error Occured';
            }
        })
        .catch((error) => {
            console.log(error);
        })
	}


	getFriendRequests = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		return fetch("http://localhost:3333/api/1.0.0/friendrequests", {
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
				friendRequestData: responseJson
			})
			for(var entry in this.state.friendRequestData)
			{
				this.getPhoto(this.state.friendRequestData[entry].user_id, entry, "request")
			}				
			console.log(responseJson);
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	acceptFriendRequest = async (friend_id) => {
		const token = await AsyncStorage.getItem('@session_token');
		return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + friend_id, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Authorization':  token
			}
		})
        .then((response) => {
            if(response.status === 200){
                console.log("Request accepted")
            }
			else if(response.status === 401){
				throw 'Unauthorised';
            }
			else if(response.status === 404){
				throw 'Not Found';
            }
			else{
                throw 'Error Occured';
            }
        })
        .then(() => {
			this.getFriends();
			this.getFriendRequests();
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	rejectFriendRequest = async (friend_id) => {
		const token = await AsyncStorage.getItem('@session_token');
		return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + friend_id, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'X-Authorization':  token
			}
		})
        .then((response) => {
            if(response.status === 200){
                console.log("Request Rejected")
            }
			else if(response.status === 401){
				throw 'Unauthorised';
            }
			else if(response.status === 404){
				throw 'Not Found';
            }
			else{
                throw 'Error Occured';
            }
        })
        .then(() => {
			this.getFriendRequests();
        })
        .catch((error) => {
            console.log(error);
        })
	}
	
	

	searchForFriends = async () => {
		const token = await AsyncStorage.getItem('@session_token');
		const ownUser_id = await AsyncStorage.getItem('@user_id');
		return fetch("http://localhost:3333/api/1.0.0/search?q=" + this.state.searchFriends, {
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
			for(var entry in responseJson) {
				if((responseJson[entry].user_givenname.toUpperCase().includes(this.state.searchFriends.toUpperCase()) 
					|| responseJson[entry].user_familyname.toUpperCase().includes(this.state.searchFriends.toUpperCase())) == false) {
					delete responseJson[entry];
				}
				else if(responseJson[entry].user_id == ownUser_id) {
					delete responseJson[entry];
				}
			}
			this.setState({
				searchData: responseJson
			})
			console.log(responseJson);
        })
        .catch((error) => {
            console.log(error);
        })
	}

	getPhoto = async (friend_id, index, type) => {
		const token = await AsyncStorage.getItem('@session_token');
		const user_id = await AsyncStorage.getItem('@user_id');
		return fetch("http://localhost:3333/api/1.0.0/user/" + friend_id + "/photo", {
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
			if(type == "request")
			{
				this.state.friendRequestData[index].user_photo = data;				
			}
			else if(type == "friend")
			{
				this.state.friendsData[index].user_photo = data;				
			}
			this.setState(this.state);
		})
		.catch((error) => {
			console.log(error)
		});
	}
	
	viewProfile = async (friend_id) => {
		await AsyncStorage.setItem('@friend_user_id', friend_id);
		this.props.navigation.navigate("View Friends Profile");
	}
  
	render(){
		return (
			<View style = {styles.Container}>
			
				<Text style = {styles.HeadingText}>Search for friends</Text>
				<View style={{flexDirection: 'row'}}>
					<TextInput style = {styles.TextInput}
						placeholder="Enter friends name"
						onChangeText={(searchFriends) => this.setState({searchFriends})}
						value={this.state.searchFriends}
					/>
					
					<Button
						title="Search"
						color="#383837"
						onPress={() => this.searchForFriends()}
					/>
				</View>
				<Text style = {styles.HeadingText}>Search Results:</Text>

				<ScrollView style = {{flex: 2}}>
					{ this.state.searchData.map((data) => {
						return(
							<View key={data.user_id}>
								<View style = {styles.postView}>
									<Text style ={{fontSize: '14px',fontWeight: 'bold'}}>{data.user_givenname} {data.user_familyname}</Text>
									<Button
										title="Add"
										color="#383837"
										onPress={() => this.addFriend(data.user_id)}
									/>
								</View>
							</View>
						)
					})}
				</ScrollView>
				
				<Text style = {styles.HeadingText}>Friends:</Text>
				
				<ScrollView style = {{flex: 5}}>
					{ this.state.friendsData.map((data) => {
						return(
							<View key={data.user_id}>
								<View style = {styles.postView}>
									<View style={{flexDirection: 'row'}}>
										<View style = {{flex: 1, flexDirection: 'row'}}>
											<Image source={{
												uri: data.user_photo,
											}}
											style={{
												width: 50,
												height: 50,
											}}/>
											<Text style ={{fontSize: '14px',fontWeight: 'bold'}}>{data.user_givenname} {data.user_familyname}</Text>
										</View>
										<View style = {{flex: 1, alignSelf: 'center'}}>
											<Button
												title="View Profile"
												color="#383837"
												onPress={() => this.viewProfile(data.user_id)}
											/>
										</View>
										<View style = {{flex: 1}}></View>
									</View>
								</View>
							</View>
						)
					})}
				</ScrollView>
				
				<View style = {{margin: '3%'}}></View>
				
				<Text style = {styles.HeadingText}>Requests:</Text>
				
				<ScrollView style = {{flex: 5}}>
					{ this.state.friendRequestData.map((data) => {
						return(
							<View key={data.user_id}>
								<View style = {styles.postView}>
									<View style={{flexDirection: 'row'}}>
										<View style = {{flex: 4, flexDirection: 'row'}}>
											<Image source={{
												uri: data.user_photo,
											}}
											style={{
												width: 50,
												height: 50,
											}}/>
											<Text style ={{fontSize: '14px',fontWeight: 'bold'}}>{data.first_name} {data.last_name}</Text>
										</View>
										<View style = {{flex: 2, alignSelf: 'center'}}>
											<Button
												title="Accept"
												color="#383837"
												onPress={() => this.acceptFriendRequest(data.user_id)}
											/>
										</View>
										<View style = {{flex: 1}}></View>
										<View style = {{flex: 2, alignSelf: 'center'}}>
											<Button
												title="Reject"
												color="#383837"
												onPress={() => this.rejectFriendRequest(data.user_id)}
											/>
										</View>
										<View style = {{flex: 1}}></View>
									</View>
								</View>
							</View>
						)
					})}
				</ScrollView>
			</View>
		)
	};
}

export default FriendScreen

const styles = StyleSheet.create({
	Container: {
		position: 'relative',
		margin:'3%',
		flex: '1'
	},
	
	HeadingText: {
		fontSize: '20px',
		fontWeight: 'bold',
		marginTop: '1%',
	},
	
	TextInput: {
		fontSize: '14px',
	},
	
	postView: {
		backgroundColor: '#d3d3d3',
	},
}); 