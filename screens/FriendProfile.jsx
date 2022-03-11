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

  Error: {
    fontSize: '14px',
    color: 'red',
  },
});

class FriendProfileScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: [],
      postData: [],
      postText: '',
      viewingID: '',
      ErrorSendPost: '',
      ErrorLike: '',
      isLoading: true,
    };
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
    const viewingId = await AsyncStorage.getItem('@user_id');
    const userId = await AsyncStorage.getItem('@friend_user_id');
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
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
          this.props.navigation.navigate('Login');
        } else {
          throw new Error('Error Occured');
        }
        return undefined;
      })
      .then((responseJson) => {
        this.setState({
          userData: responseJson,
          viewingID: viewingId,
          ErrorSendPost: '',
          ErrorLike: '',
        });
        this.getPhoto(this.state.userData.user_id, 0, 'Profile');
        console.log(this.state.userData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getPhoto = async (photoId, index, type) => {
    const token = await AsyncStorage.getItem('@session_token');
    return fetch(`http://localhost:3333/api/1.0.0/user/${photoId}/photo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((res) => res.blob())
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);
        if (type === 'Profile') {
          this.state.userData.user_photo = data;
        } else if (type === 'Post') {
          this.state.postData[index].user_photo = data;
        }
        // eslint-disable-next-line react/no-access-state-in-setstate
        this.setState(this.state);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getPosts = async () => {
    this.checkSchedule();
    const token = await AsyncStorage.getItem('@session_token');
    const userId = await AsyncStorage.getItem('@friend_user_id');
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/post`, {
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
          postData: responseJson,
          isLoading: false,
        });
        for (const entry in this.state.postData) {
          this.getPhoto(this.state.postData[entry].author.user_id, entry, 'Post');
        }
        console.log(responseJson);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  sendPost = async () => {
    if (this.state.postText.length < 1) {
      this.setState({ ErrorSendPost: 'Post cant be blank' });
    } else {
      this.setState({ ErrorSendPost: '' });
      const token = await AsyncStorage.getItem('@session_token');
      const userId = await AsyncStorage.getItem('@friend_user_id');
      this.data = {
        text: this.state.postText,
      };
      return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
        body: JSON.stringify(this.data),
      })
        .then((response) => {
          if (response.status === 201) {
            return response.json();
          } if (response.status === 401) {
            throw new Error('Unauthorised');
          } else if (response.status === 404) {
            throw new Error('Not Found');
          } else {
            throw new Error('Something went wrong');
          }
        })
        .then(async () => {
          this.getPosts();
          this.setState({
            postText: '',
            ErrorSendPost: '',
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return undefined;
  };

  saveDraft = async () => {
    if (this.state.postText.length < 1) {
      this.setState({ ErrorSendPost: 'Post cant be blank' });
    } else {
      this.setState({ ErrorSendPost: '' });
      let drafts = await AsyncStorage.getItem('@drafts');
      drafts = JSON.parse(drafts);
      const userId = await AsyncStorage.getItem('@user_id');
      const friendUserId = await AsyncStorage.getItem('@friend_user_id');
      this.profileName = {
        user_id: friendUserId,
        first_name: this.state.userData.first_name,
        last_name: this.state.userData.last_name,
      };
      if (drafts === null || drafts.length === 0) {
        this.data = {
          draft_id: 1,
          text: this.state.postText,
          author_id: userId,
          profile: this.profileName,
          schedule: null,
        };
        drafts = [this.data];
      } else {
        this.data = {
          draft_id: (drafts[drafts.length - 1].draft_id + 1),
          text: this.state.postText,
          author_id: userId,
          profile: this.profileName,
        };
        drafts[drafts.length] = this.data;
        console.log(drafts);
      }
      await AsyncStorage.setItem('@drafts', JSON.stringify(drafts));
      this.setState({ postText: '' });
    }
  };

  checkSchedule = async () => {
    let drafts = await AsyncStorage.getItem('@drafts');
    const userId = await AsyncStorage.getItem('@friend_user_id');
    drafts = JSON.parse(drafts);
    for (const entry in drafts) {
      if (drafts[entry].profile.user_id === userId && drafts[entry].schedule !== null) {
        const scheduleTime = new Date(drafts[entry].schedule);
        const timeNow = new Date();
        if (scheduleTime < timeNow) {
          this.setState({ postText: drafts[entry].text });
          this.deleteDraft(drafts[entry].draft_id);
        }
      }
    }
  };

  deleteDraft = async (draftId) => {
    let drafts = await AsyncStorage.getItem('@drafts');
    drafts = JSON.parse(drafts);
    drafts = drafts.filter((entry) => entry.draft_id !== draftId);
    console.log(drafts);
    await AsyncStorage.setItem('@drafts', JSON.stringify(drafts));
    this.sendPost();
  };

  deletePost = async (postId) => {
    const token = await AsyncStorage.getItem('@session_token');
    const userId = await AsyncStorage.getItem('@friend_user_id');
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/post/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.getPosts();
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden- can only delete own posts');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Something went wrong');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  likePost = async (postId) => {
    const token = await AsyncStorage.getItem('@session_token');
    const userId = await AsyncStorage.getItem('@friend_user_id');
    const index = this.state.postData.findIndex((item) => item.post_id === postId);
    console.log(index);
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/post/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.state.postData[index].error = false;
          this.setState({ ErrorLike: '' });
          this.getPosts();
        } else if (response.status === 403 || response.status === 400) {
          this.state.postData[index].error = true;
          this.setState({ ErrorLike: 'Already liked this post' });
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Something went wrong');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  unlikePost = async (postId) => {
    const token = await AsyncStorage.getItem('@session_token');
    const userId = await AsyncStorage.getItem('@friend_user_id');
    const index = this.state.postData.findIndex((item) => item.post_id === postId);
    const likeTest = this.state.postData[index].numLikes;
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/post/${postId}/like`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.getPosts()
            .then(() => {
              if (likeTest === this.state.postData[index].numLikes) {
                this.state.postData[index].error = true;
                this.setState({ ErrorLike: 'You have not liked this post' });
                console.log(this.state.postData[index].error);
              } else {
                this.state.postData[index].error = false;
                this.setState({ ErrorLike: '' });
              }
            });
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden- you have not liked this post');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Something went wrong');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  editPost = async (postId) => {
    await AsyncStorage.setItem('@post_id', postId);
    this.props.navigation.navigate('Edit Friends Post');
  };

  viewPost = async (postId) => {
    await AsyncStorage.setItem('@post_id', postId);
    this.props.navigation.navigate('View Friends Post');
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
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={{
              uri: this.state.userData.user_photo,
            }}
            style={{
              width: 100,
              height: 100,
            }}
          />
          <View style={{ left: '3%' }}>
            <Text accessibilityRole="text" style={styles.ProfileText}>
              {this.state.userData.first_name}
              {' '}
              {this.state.userData.last_name}
            </Text>
            <Text accessibilityRole="text" style={styles.ProfileText}>
              Friend Count:
              {' '}
              {this.state.userData.friend_count}
            </Text>
          </View>
        </View>

        <Text accessibilityRole="text" style={styles.ProfileText}>Posts:</Text>

        <TextInput
          style={styles.TextInput}
          accessibilityRole="search"
          placeholder="Enter Post Text"
          textAlignVertical="top"
          multiline="true"
          onChangeText={(postText) => this.setState({ postText })}
          value={this.state.postText}
        />

        <View style={{ margin: '1%' }} />

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 20 }}>
            <Button
              title="Send Post"
              accessibilityRole="button"
              color="#383837"
              onPress={() => this.sendPost()}
            />
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 20 }}>
            <Button
              title="Save Draft"
              accessibilityRole="button"
              color="#383837"
              onPress={() => this.saveDraft()}
            />
          </View>
        </View>

        <Text accessibilityRole="text" style={styles.Error}>{this.state.ErrorSendPost}</Text>

        <View style={{ margin: '1%' }} />

        <ScrollView>
          { this.state.postData.map((data) => (
            <View key={data.post_id}>
              <View style={styles.postView}>
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    source={{
                      uri: data.user_photo,
                    }}
                    style={{
                      width: 50,
                      height: 50,
                    }}
                  />
                  <View style={{ flex: 1, paddingLeft: '1%' }}>
                    <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {data.author.first_name}
                      {' '}
                      {data.author.last_name}
                    </Text>
                    <Text accessibilityRole="text">{data.text}</Text>
                    <Text accessibilityRole="text">
                      Likes:
                      {data.numLikes}
                    </Text>
                    <Text accessibilityRole="text">{new Date(data.timestamp).toUTCString()}</Text>
                  </View>
                </View>
                {(data.author.user_id === parseInt(this.state.viewingID, 10)) ? (
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 20 }}>
                      <Button
                        title="Delete"
                        accessibilityRole="button"
                        color="#383837"
                        onPress={() => this.deletePost(data.post_id)}
                      />
                    </View>
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 20 }}>
                      <Button
                        title="Update"
                        accessibilityRole="button"
                        color="#383837"
                        onPress={() => this.editPost(data.post_id)}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 4, alignSelf: 'center' }}>
                      <Button
                        title="View Post"
                        accessibilityRole="button"
                        color="#383837"
                        onPress={() => this.viewPost(data.post_id)}
                      />
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ flex: 2, alignSelf: 'center' }}>
                      <Button
                        title="Like"
                        accessibilityRole="button"
                        color="#383837"
                        onPress={() => this.likePost(data.post_id)}
                      />
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ flex: 2, alignSelf: 'center' }}>
                      <Button
                        title="Unlike"
                        accessibilityRole="button"
                        color="#383837"
                        onPress={() => this.unlikePost(data.post_id)}
                      />
                    </View>

                    <View style={{ flex: 1 }} />
                  </View>
                )}
              </View>
              {(data.error) && (
              <Text accessibilityRole="text" style={styles.Error}>{this.state.ErrorLike}</Text>
              )}
              <View style={{ margin: '1%', backgroundColor: '#ffffff' }} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

export default FriendProfileScreen;
