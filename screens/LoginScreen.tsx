import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../navigation/AuthContext';
import { post } from '../api';
import PinView from 'react-native-pin-view';
const { width, height } = Dimensions.get('window');
//@ts-ignore
export default function LoginScreen({ navigation }){

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ isLoading, setIsLoading ] = useState(false);
  //@ts-ignore
  const { login } = useContext(AuthContext);

  const onPressCreateAccount = () => {
    navigation.navigate('CreateAccountScreen');
  };

  const onPressLogin = async () => {
    setIsLoading(true);
    const data = await post(`/users/login`, { email, password });
    setIsLoading(false);
    if(data && data.token){
      console.log(`data token token ${data}`)
      await AsyncStorage.setItem('token', data.token);
      login();
      return;
    }
    Alert.alert('Login or password invalid');
  }

  return (
    <ImageBackground style={{ width: width, height: height }} source={require('../assets/images/bg.png')}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/icon-on.png')}
          style={styles.logo}
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
        <Button mode="contained" disabled={isLoading} style={styles.btn} onPress={onPressLogin}>
          {isLoading ? <ActivityIndicator animating /> : `Login`}
        </Button>
        <Pressable style={styles.btn} onPress={onPressCreateAccount}>
          <Text style={styles.label}>Create an account</Text>
        </Pressable>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    margin: 20
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
  },
  logo: {
    alignSelf: 'center',
    width: 150,
    height: 150
  }
})
