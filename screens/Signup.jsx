import React, { Component } from 'react';
import {
  Text, View, StyleSheet, Button,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  Container: {
    position: 'relative',
    top: '35%',
    left: '35%',
    width: '35%',
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

class SignupScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      errorFirst: '',
      errorLast: '',
      errorEmail: '',
      errorPass: '',
      errorDuplicate: '',
    };
  }

  signup = async () => {
    let errorBool = false;
    this.setState({ errorDuplicate: '' });
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

      return fetch('http://localhost:3333/api/1.0.0/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.data),
      })
        .then((response) => {
          if (response.status === 201) {
            return response.json();
          } if (response.status === 400) {
            this.setState({ errorDuplicate: 'Email already in use' });
            throw new Error('Bad Request');
          } else {
            throw new Error('Something went wrong');
          }
        })
        .then(async (responseJson) => {
          console.log(responseJson);
          this.props.navigation.navigate('Login');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return undefined;
  };

  render() {
    return (
      <View style={styles.Container}>

        <Text accessibilityRole="text" style={styles.InputTitle}>First Name</Text>
        <TextInput
          style={styles.TextInput}
          accessibilityRole="search"
          placeholder="Enter first name"
          onChangeText={(firstName) => this.setState({ firstName })}
          value={this.state.firstName}
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorFirst}</Text>

        <Text accessibilityRole="text" style={styles.InputTitle}>Last Name</Text>
        <TextInput
          style={styles.TextInput}
          accessibilityRole="search"
          placeholder="Enter last name"
          onChangeText={(lastName) => this.setState({ lastName })}
          value={this.state.lastName}
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorLast}</Text>

        <Text accessibilityRole="text" style={styles.InputTitle}>Email</Text>
        <TextInput
          style={styles.TextInput}
          accessibilityRole="search"
          placeholder="Enter email"
          onChangeText={(email) => this.setState({ email })}
          value={this.state.email}
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorEmail}</Text>

        <Text accessibilityRole="text" style={styles.InputTitle}>Password</Text>
        <TextInput
          style={styles.TextInput}
          accessibilityRole="search"
          placeholder="Enter password"
          onChangeText={(password) => this.setState({ password })}
          value={this.state.password}
          secureTextEntry
        />
        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorPass}</Text>

        <Button
          title="Create Account"
          accessibilityRole="button"
          color="#383837"
          onPress={() => this.signup()}
        />

        <Text accessibilityRole="text" style={styles.Error}>{this.state.errorDuplicate}</Text>

        <View style={{ margin: '3%' }} />

        <Button
          title="Go Back"
          accessibilityRole="button"
          color="#383837"
          onPress={() => this.props.navigation.goBack()}
        />
      </View>
    );
  }
}

export default SignupScreen;
