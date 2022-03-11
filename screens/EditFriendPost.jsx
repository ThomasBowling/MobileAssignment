import React, { Component } from 'react';
import {
  Text, View, StyleSheet, Button, Image,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
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

  postView: {
    backgroundColor: '#d3d3d3',
  },

  Error: {
    fontSize: '14px',
    color: 'red',
  },
});

class EditFriendsPostScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      oldPost: [],
      newText: '',
      ErrorSendPost: '',
    };
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
    const userId = await AsyncStorage.getItem('@friend_user_id');
    const postId = await AsyncStorage.getItem('@post_id');
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/post/${postId}`, {
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
          oldPost: responseJson,
          ErrorSendPost: '',
        });
        this.getPhoto(this.state.oldPost.author.user_id);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getPhoto = async (photoId) => {
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
        this.state.oldPost.user_photo = data;
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  editPost = async () => {
    if (this.state.newText.length < 1) {
      this.setState({ ErrorSendPost: 'Post cant be blank' });
    } else {
      this.setState({ ErrorSendPost: '' });
      const token = await AsyncStorage.getItem('@session_token');
      const userId = await AsyncStorage.getItem('@friend_user_id');
      const postId = await AsyncStorage.getItem('@post_id');
      this.data = {
        text: this.state.newText,
      };
      return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/post/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
        body: JSON.stringify(this.data),
      })
        .then((response) => {
          if (response.status === 200) {
            return 'OK';
          } if (response.status === 400) {
            throw new Error('Bad Request');
          } else if (response.status === 401) {
            throw new Error('Unauthorised');
          } else if (response.status === 403) {
            throw new Error('Forbidden- can only edit own posts');
          } else if (response.status === 404) {
            throw new Error('Not Found');
          } else {
            throw new Error('Something went wrong');
          }
        })
        .then(async () => {
          console.log(this.data);
          this.props.navigation.navigate('View Friends Profile');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return undefined;
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
        <View style={styles.postView}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={{
                uri: this.state.oldPost.user_photo,
              }}
              style={{
                width: 50,
                height: 50,
              }}
            />
            <View style={{ flex: 1, paddingLeft: '1%' }}>
              <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {this.state.oldPost.author.first_name}
                {' '}
                {this.state.oldPost.author.last_name}
              </Text>
              <Text accessibilityRole="text">{this.state.oldPost.text}</Text>
              <Text accessibilityRole="text">
                Likes:
                {this.state.oldPost.numLikes}
              </Text>
              <Text accessibilityRole="text">{new Date(this.state.oldPost.timestamp).toUTCString()}</Text>
            </View>
          </View>
        </View>

        <View style={{ margin: '3%' }} />

        <TextInput
          style={styles.TextInput}
          accessibilityRole="search"
          placeholder={this.state.oldPost.text}
          textAlignVertical="top"
          multiline="true"
          onChangeText={(newText) => this.setState({ newText })}
          value={this.state.postText}
        />

        <View style={{ margin: '3%' }} />

        <Button
          title="Edit Post"
          accessibilityRole="button"
          color="#383837"
          onPress={() => this.editPost()}
        />
        <Text style={styles.Error}>{this.state.ErrorSendPost}</Text>
      </View>
    );
  }
}

export default EditFriendsPostScreen;
