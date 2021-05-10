import React, { useState, useContext } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../navigation/AuthContext';
import { TextInput, Button } from 'react-native-paper';
import { post } from '../api';
const { width, height } = Dimensions.get('window');
//@ts-ignore
export default function CreateAccountScreen({ navigation }){

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ name, setName ] = useState('');
  const [ isLoading, setIsLoading ] = useState(false);

  const context = useContext(AuthContext);

  const onPressCreateAccount = async () => {
    setIsLoading(true);
    const data = await post(`/users`, { name, email, password })
        .then(async (data)=>{
          console.log('token is ',data.token)
          await AsyncStorage.setItem('token', data.token);
          setIsLoading(false);
          context && context.login();
        })
        .catch((error)=>console.log(`error is ${error}`));
  };

  return (
    <ImageBackground style={{ width: width, height: height }} source={require('../assets/images/bg.png')}>
      <View style={styles.container}>
        <TextInput
          label="Name"
          value={name}
          style={styles.input}
          onChangeText={text => setName(text)}
        />
        <TextInput
          label="Email"
          value={email}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          label="Password"
          value={password}
          style={styles.input}
          secureTextEntry
          onChangeText={text => setPassword(text)}
        />
        <Button mode="contained" disabled={isLoading} style={styles.btn} onPress={onPressCreateAccount}>
          {isLoading ? <ActivityIndicator animating /> : `Create`}
        </Button>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 100,
  },
  input: {
    marginTop: 15,
    backgroundColor: '#FFFFFF'
  },
  btn: {
    marginTop: 15,
    height: 50,
    justifyContent:'center',
    alignItems: 'center'
  },
  label: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
})
