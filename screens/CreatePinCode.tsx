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
export default function CreatePinCodeScreen({ navigation }){


    return (
        <ImageBackground style={{ width: width, height: height }} source={require('../assets/images/bg.png')}>
            <View style={styles.container}>

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
