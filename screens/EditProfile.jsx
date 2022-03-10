/* eslint-disable no-restricted-syntax */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  Text, View, StyleSheet, Button, Image,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  Container: {
    position: 'relative',
    left: '30%',
    width: '40%',
  },
  TextInput: {
    fontSize: '14px',
  },
  InputTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
  },

  Error: {
    fontSize: '14px',
    color: 'red',
  },
});

class EditProfileScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      photo: '',
      errorFirst: '',
      errorLast: '',
      errorEmail: '',
      errorPass: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getPhoto();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateaccount = async () => {
    let errorBool = false;
    if (this.state.firstName.length === 0) {
      this.setState({ errorFirst: "First name field can't be empty" });
      errorBool = true;
    } else {
      this.setState({ errorFirst: '' });
    }
    if (this.state.lastName.length === 0) {
      this.setState({ errorLast: "Last name field can't be empty" });
      errorBool = true;
    } else {
      this.setState({ errorPass: '' });
    }
    // Regex Expression from https://www.w3resource.com/javascript/form/email-validation.php
    if (!(/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email))) {
      this.setState({ errorEmail: 'Email is invalid' });
      errorBool = true;
    } else {
      this.setState({ errorEmail: '' });
    }

    if (this.state.password.length < 6) {
      this.setState({ errorPass: 'Password must be greater then 5 characters' });
      errorBool = true;
    } else {
      this.setState({ errorPass: '' });
    }
    if (!errorBool) {
      this.data = {
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.email,
        password: this.state.password,
      };

      for (const entry in this.data.values) {
        if (this.data.values[entry] === '') {
          delete this.data[entry];
        }
      }

      const token = await AsyncStorage.getItem('@session_token');
      const userId = await AsyncStorage.getItem('@user_id');
      return fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'X-Authorization': token,
          'Content-Type': 'application/json',
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
          } else {
            throw new Error('Something went wrong');
          }
        })
        .then(async () => {
          console.log(this.data);
          this.props.navigation.navigate('ProfileStack');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return undefined;
  };

  getPhoto = async () => {
    const token = await AsyncStorage.getItem('@session_token');
    const userId = await AsyncStorage.getItem('@user_id');
    console.log(userId);
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((res) => res.blob())
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);
        this.setState({
          photo: data,
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
          <Text accessibilityRole="text">Loading..</Text>
        </View>
      );
    }

    return (
      <View style={styles.Container}>
        <Image
          source={{
            uri: this.state.photo,
          }}
          style={{
            width: '100%',
            height: undefined,
            aspectRatio: 3 / 2,
          }}
        />
        <Button
          accessibilityRole="button"
          title="Edit Profile Picture"
          color="#383837"
          onPress={() => this.props.navigation.navigate('Camera Screen')}
        />

        <Text accessibilityRole="text" style={styles.InputTitle}>First Name</Text>
        <TextInput
          accessibilityRole="search"
          style={styles.TextInput}
          placeholder="Enter first name"
          onChangeText={(firstName) => this.setState({ firstName })}
          value={this.state.firstName}
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorFirst}</Text>

        <Text style={styles.InputTitle}>Last Name</Text>
        <TextInput
          accessibilityRole="search"
          style={styles.TextInput}
          placeholder="Enter last name"
          onChangeText={(lastName) => this.setState({ lastName })}
          value={this.state.lastName}
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorLast}</Text>

        <Text accessibilityRole="text" style={styles.InputTitle}>Email</Text>
        <TextInput
          accessibilityRole="search"
          style={styles.TextInput}
          placeholder="Enter email"
          onChangeText={(email) => this.setState({ email })}
          value={this.state.email}
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorEmail}</Text>

        <Text accessibilityRole="text" style={styles.InputTitle}>Password</Text>
        <TextInput
          accessibilityRole="search"
          style={styles.TextInput}
          placeholder="Enter password"
          onChangeText={(password) => this.setState({ password })}
          value={this.state.password}
          secureTextEntry
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorPass}</Text>

        <Button
          accessibilityRole="button"
          title="Update Account"
          color="#383837"
          onPress={() => this.updateaccount()}
        />
      </View>
    );
  }
}

export default EditProfileScreen;
