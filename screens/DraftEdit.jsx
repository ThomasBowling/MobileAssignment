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

class EditDraftScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      oldDraft: [],
      userData: [],
      newText: '',
      ErrorSendPost: '',
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getData();
      this.getDraft();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getData = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    const userId = await AsyncStorage.getItem('@user_id');
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
          throw new Error('Unauthorised');
        } else {
          throw new Error('Error Occured');
        }
      })
      .then((responseJson) => {
        this.setState({
          userData: responseJson,
        });
        this.getPhoto(this.state.userData.user_id);
        console.log(this.state.userData);
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
        this.state.userData.user_photo = data;
        // eslint-disable-next-line react/no-access-state-in-setstate
        this.setState(this.state);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getDraft = async () => {
    let drafts = await AsyncStorage.getItem('@drafts');
    drafts = JSON.parse(drafts);
    const draftId = parseInt(await AsyncStorage.getItem('@draft_id'), 10);
    const draft = drafts.find((entry) => entry.draft_id === draftId);
    this.setState({
      oldDraft: draft,
      isLoading: false,
    });
  };

  editDraft = async () => {
    if (this.state.newText.length < 1) {
      this.setState({ ErrorSendPost: 'Post cant be blank' });
    } else {
      this.setState({ ErrorSendPost: '' });
      let drafts = await AsyncStorage.getItem('@drafts');
      const draftId = parseInt(await AsyncStorage.getItem('@draft_id'), 10);
      drafts = JSON.parse(drafts);
      const draftIndex = drafts.findIndex(((entry) => entry.draft_id === draftId));
      console.log(draftIndex);
      drafts[draftIndex].text = this.state.newText;
      await AsyncStorage.setItem('@drafts', JSON.stringify(drafts));
      this.props.navigation.navigate('DraftStacks');
    }
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
                uri: this.state.userData.user_photo,
              }}
              style={{
                width: 50,
                height: 50,
              }}
            />
            <View style={{ flex: 1, paddingLeft: '1%' }}>
              <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {this.state.userData.first_name}
                {' '}
                {this.state.userData.last_name}
              </Text>
              <Text accessibilityRole="text">{this.state.oldDraft.text}</Text>
              <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                Posting on:
                {this.state.oldDraft.profile.first_name}
                {' '}
                {this.state.oldDraft.profile.last_name}
                &apos;s profile
              </Text>
            </View>
          </View>
        </View>

        <View style={{ margin: '3%' }} />

        <TextInput
          accessibilityRole="search"
          style={styles.TextInput}
          placeholder={this.state.oldDraft.text}
          textAlignVertical="top"
          multiline="true"
          onChangeText={(newText) => this.setState({ newText })}
          value={this.state.postText}
        />

        <View style={{ margin: '3%' }} />

        <Button
          accessibilityRole="button"
          title="Edit Draft"
          color="#383837"
          onPress={() => this.editDraft()}
        />
        <Text style={styles.Error}>{this.state.ErrorSendPost}</Text>
      </View>
    );
  }
}

export default EditDraftScreen;
