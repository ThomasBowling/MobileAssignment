import React, { Component } from 'react';
import {
  View, Text, Button, Image, StyleSheet,
} from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  Container: {
    position: 'relative',
    margin: '3%',
    flex: '1',
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
  Error: {
    fontSize: '14px',
    color: 'red',
  },
});

class FriendScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      friendsData: [],
      friendRequestData: [],
      searchFriends: '',
      searchData: [],
      ErrorSearch: '',
      ErrorRequest: '',
      isLoading: true,
    };
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
    this.setState({ ErrorSearch: '' });
    this.setState({ ErrorRequest: '' });
    const token = await AsyncStorage.getItem('@session_token');
    const userId = await AsyncStorage.getItem('@user_id');
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/friends`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        if (response.status === 401) {
          throw new Error('Unauthorised');
        } else {
          throw new Error('Error Occured');
        }
      })
      .then((responseJson) => {
        this.setState({
          friendsData: responseJson,
        });
        for (const entry in this.state.friendsData) {
          this.getPhoto(this.state.friendsData[entry].user_id, entry, 'friend');
        }
        console.log(responseJson);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  addFriend = async (friendId) => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch(`http://localhost:3333/api/1.0.0/user/${friendId}/friends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 201) {
          console.log('Request sent');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          this.setState({ ErrorRequest: '' });
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Error Occured');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getFriendRequests = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch('http://localhost:3333/api/1.0.0/friendrequests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        if (response.status === 401) {
          throw new Error('Unauthorised');
        } else {
          throw new Error('Error Occured');
        }
      })
      .then((responseJson) => {
        this.setState({
          friendRequestData: responseJson,
          isLoading: false,
        });
        for (const entry in this.state.friendRequestData) {
          this.getPhoto(this.state.friendRequestData[entry].user_id, entry, 'request');
        }
        console.log(responseJson);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  acceptFriendRequest = async (friendId) => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch(`http://localhost:3333/api/1.0.0/friendrequests/${friendId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Request accepted');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Error Occured');
        }
      })
      .then(() => {
        this.getFriends();
        this.getFriendRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  rejectFriendRequest = async (friendId) => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch(`http://localhost:3333/api/1.0.0/friendrequests/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Request Rejected');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Error Occured');
        }
      })
      .then(() => {
        this.getFriendRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  searchForFriends = async () => {
    this.setState({ searchData: [] });
    if (this.state.searchFriends.length < 3) {
      this.setState({ ErrorSearch: 'Please enter a minimum of 3 characters' });
    } else {
      const token = await AsyncStorage.getItem('@session_token');
      const ownUserId = parseInt(await AsyncStorage.getItem('@user_id'), 10);
      return fetch(`http://localhost:3333/api/1.0.0/search?q=${this.state.searchFriends}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
          if (response.status === 401) {
            throw new Error('Unauthorised');
          } else {
            throw new Error('Error Occured');
          }
        })
        .then((responseJson) => {
          let search = responseJson;
          for (const entry in search) {
            search[entry].user_givenname = search[entry].user_givenname.toUpperCase();
            search[entry].user_familyname = search[entry].user_familyname.toUpperCase();
            if ((search[entry].user_givenname.includes(this.state.searchFriends)
            || search[entry].user_familyname.includes(this.state.searchFriends)) === false) {
              delete search[entry];
            } else if (search[entry].user_id === ownUserId) {
              delete search[entry];
            } else {
              for (const friend in this.state.friendsData) {
                if (this.state.friendsData[friend].user_id === search[entry].user_id) {
                  delete search[entry];
                }
              }
              for (const friend in this.state.friendRequestData) {
                if (this.state.friendRequestData[friend].user_id === search[entry].user_id) {
                  delete search[entry];
                }
              }
            }
          }
          search = search.filter((value) => Object.keys(value).length !== 0);
          this.setState({
            searchData: search,
          });
          if (this.state.searchData.length === 0) {
            this.setState({ ErrorSearch: 'No Results' });
          } else {
            this.setState({ ErrorSearch: '' });
          }
          console.log(search);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return undefined;
  };

  getPhoto = async (friendId, index, type) => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch(`http://localhost:3333/api/1.0.0/user/${friendId}/photo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((res) => res.blob())
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);
        if (type === 'request') {
          this.state.friendRequestData[index].user_photo = data;
        } else if (type === 'friend') {
          this.state.friendsData[index].user_photo = data;
        }
        // eslint-disable-next-line react/no-access-state-in-setstate
        this.setState(this.state);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  viewProfile = async (friendId) => {
    await AsyncStorage.setItem('@friend_user_id', friendId);
    this.props.navigation.navigate('View Friends Profile');
  };

  formatSearch = (searchText) => {
    this.setState({ searchFriends: searchText.toUpperCase() });
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Text accessibilityRole="text">Loading..</Text>
        </View>
      );
    }

    return (
      <View style={styles.Container}>
        <Text accessibilityRole="text" style={styles.HeadingText}>Search for friends</Text>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={styles.TextInput}
            accessibilityRole="search"
            autoCapitalize="characters"
            placeholder="Search (will be in Caps)"
            onChangeText={(searchFriends) => this.formatSearch(searchFriends)}
            value={this.state.searchFriends}
          />

          <Button
            title="Search"
            accessibilityRole="button"
            color="#383837"
            onPress={() => this.searchForFriends()}
          />
        </View>

        <Text accessibilityRole="text" style={styles.Error}>{this.state.ErrorSearch}</Text>
        <Text accessibilityRole="text" style={styles.HeadingText}>Search Results:</Text>

        <ScrollView style={{ flex: 2 }}>
          { this.state.searchData.map((data) => (
            <View key={data.user_id}>
              <View style={styles.postView}>
                <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {data.user_givenname}
                  {' '}
                  {data.user_familyname}
                </Text>
                <Button
                  title="Add"
                  accessibilityRole="button"
                  color="#383837"
                  onPress={() => this.addFriend(data.user_id)}
                />
              </View>
            </View>
          ))}
        </ScrollView>

        <Text accessibilityRole="text" style={styles.HeadingText}>Friends:</Text>

        <ScrollView style={{ flex: 5 }}>
          { this.state.friendsData.map((data) => (
            <View key={data.user_id}>
              <View style={styles.postView}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Image
                      source={{
                        uri: data.user_photo,
                      }}
                      style={{
                        width: 50,
                        height: 50,
                      }}
                    />
                    <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {data.user_givenname}
                      {' '}
                      {data.user_familyname}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignSelf: 'center' }}>
                    <Button
                      title="View Profile"
                      accessibilityRole="button"
                      color="#383837"
                      onPress={() => this.viewProfile(data.user_id)}
                    />
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={{ margin: '3%' }} />

        <Text accessibilityRole="text" style={styles.HeadingText}>Requests:</Text>

        <ScrollView style={{ flex: 5 }}>
          { this.state.friendRequestData.map((data) => (
            <View key={data.user_id}>
              <View style={styles.postView}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 4, flexDirection: 'row' }}>
                    <Image
                      source={{
                        uri: data.user_photo,
                      }}
                      style={{
                        width: 50,
                        height: 50,
                      }}
                    />
                    <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {data.first_name}
                      {' '}
                      {data.last_name}
                    </Text>
                  </View>
                  <View style={{ flex: 2, alignSelf: 'center' }}>
                    <Button
                      title="Accept"
                      accessibilityRole="button"
                      color="#383837"
                      onPress={() => this.acceptFriendRequest(data.user_id)}
                    />
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={{ flex: 2, alignSelf: 'center' }}>
                    <Button
                      title="Reject"
                      accessibilityRole="button"
                      color="#383837"
                      onPress={() => this.rejectFriendRequest(data.user_id)}
                    />
                  </View>
                  <View style={{ flex: 1 }} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

export default FriendScreen;
