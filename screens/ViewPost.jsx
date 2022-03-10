import React, { Component } from 'react';
import {
  Text, View, StyleSheet, Image,
} from 'react-native';
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
});

class ViewPostScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      postData: [],
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
    const userId = await AsyncStorage.getItem('@user_id');
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
          postData: responseJson,
        });
        this.getPhoto(this.state.postData.author.user_id);
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
        this.state.postData.user_photo = data;
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Text>Loading..</Text>
        </View>
      );
    }

    return (
      <View style={styles.Container}>
        <View style={styles.postView}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={{
                uri: this.state.postData.user_photo,
              }}
              style={{
                width: 50,
                height: 50,
              }}
            />
            <View style={{ flex: 1, paddingLeft: '1%' }}>
              <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {this.state.postData.author.first_name}
                {' '}
                {this.state.postData.author.last_name}
              </Text>
              <Text accessibilityRole="text">{this.state.postData.text}</Text>
              <Text accessibilityRole="text">
                Likes:
                {this.state.postData.numLikes}
              </Text>
              <Text accessibilityRole="text">{new Date(this.state.postData.timestamp).toUTCString()}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default ViewPostScreen;
