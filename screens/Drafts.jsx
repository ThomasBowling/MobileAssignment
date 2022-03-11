import React, { Component } from 'react';
import {
  View, Text, Button, Image, StyleSheet,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
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

class DraftScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      userData: [],
      draftData: [],
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getData();
      this.getDrafts();
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

  getDrafts = async () => {
    let drafts = await AsyncStorage.getItem('@drafts');
    drafts = JSON.parse(drafts);
    console.log(drafts);
    const userId = await AsyncStorage.getItem('@user_id');
    const filteredDrafts = [];
    for (const entry in drafts) {
      if (drafts[entry].author_id === userId) {
        filteredDrafts.push(drafts[entry]);
      }
    }
    console.log(filteredDrafts);
    this.setState({
      draftData: filteredDrafts,
      isLoading: false,
    });
  };

  sendDraft = async (draftText, profileId, draftId) => {
    const token = await AsyncStorage.getItem('@session_token');
    this.data = {
      text: draftText,
    };
    return fetch(`http://localhost:3333/api/1.0.0/user/${profileId}/post`, {
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
        this.deleteDraft(draftId);
        this.getDrafts();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  deleteDraft = async (draftId) => {
    let drafts = await AsyncStorage.getItem('@drafts');
    drafts = JSON.parse(drafts);
    drafts = drafts.filter((entry) => entry.draft_id !== draftId);
    console.log(drafts);
    await AsyncStorage.setItem('@drafts', JSON.stringify(drafts));
    this.getDrafts();
  };

  editDraft = async (draftId) => {
    await AsyncStorage.setItem('@draft_id', draftId);
    this.props.navigation.navigate('Edit Draft');
  };

  scheduleDraft = async (draftId) => {
    await AsyncStorage.setItem('@draft_id', draftId);
    this.props.navigation.navigate('Schedule Draft');
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
        <Text accessibilityRole="text" style={styles.ProfileText}>Drafts:</Text>

        <View style={{ margin: '1%' }} />

        {(this.state.draftData.length === 0) ? (
          <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>No Drafts Saved</Text>
        ) : (
          <ScrollView>
            { this.state.draftData.map((data) => (
              <View key={data.draft_id}>
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
                      <Text accessibilityRole="text">{data.text}</Text>
                      <Text accessibilityRole="text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        Posting on:
                        {data.profile.first_name}
                        {' '}
                        {data.profile.last_name}
                        &apos;s profile
                      </Text>
                      <View style={{ margin: '1%' }} />

                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 20 }}>
                          <Button
                            title="Delete"
                            accessibilityRole="button"
                            color="#383837"
                            onPress={() => this.deleteDraft(data.draft_id)}
                          />
                        </View>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 20 }}>
                          <Button
                            title="Update"
                            accessibilityRole="button"
                            color="#383837"
                            onPress={
                          () => this.editDraft(data.draft_id)
                        }
                          />
                        </View>
                      </View>

                      <View style={{ margin: '1%' }} />

                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 20 }}>
                          <Button
                            title="Send Post"
                            accessibilityRole="button"
                            color="#383837"
                            onPress={
                          () => this.sendDraft(data.text, data.profile.user_id, data.draft_id)
                        }
                          />
                        </View>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 20 }}>
                          <Button
                            title="Schedule"
                            accessibilityRole="button"
                            color="#383837"
                            onPress={
                          () => this.scheduleDraft(data.draft_id)
                        }
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
}

export default DraftScreen;
