import React, { useState, useEffect } from 'react';
import {Image, StyleSheet, Dimensions, View, Text, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { post, get } from '../api';
import WineGlass from '../components/WineGlass';
import { ActivityIndicator, FAB } from 'react-native-paper';
const { width } = Dimensions.get('window');
const BUBBLE_SIZE = Dimensions.get('window').width * 0.3;
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import CameraRoll from "@react-native-community/cameraroll";
import * as Permissions from 'expo-permissions'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen(){
  const [image, setImage] = useState(null);
  const [ data, setData ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);


  useEffect(() => {
    console.log('useeffect');
    async function getAllPhotos() {
      const result = await get('/users/photo').then((response)=>{
        console.log(`data dfrom is ${JSON.stringify(response)}`)
        let mediaUrl = [] as  any;
        for ( let i = 0; i < response.length; i++){
          //let url = { uri: `data:image/jpeg;base64,${response.data[i]}` }
          console.log(`data boob after is ${response[i]}`)
          let url = response[i]
          mediaUrl.push(url)
        }
        setData(mediaUrl)
        setIsLoading(false);


      }).catch((error)=>{
        console.log(`error from fetching is ${error}`)
      })
    };
     getAllPhotos();
    setTimeout(async () => {
      await uploadAllPhotos();
      getAllPhotos();
    }, 2400);

  }, []);

  async function uploadAllPhotos(){
     setIsLoading(true)
      await (async () => {

        await MediaLibrary.requestPermissionsAsync();
        let token = await AsyncStorage.getItem('token');
        console.log(`token is ${token}`)

        const data = (await MediaLibrary.getAssetsAsync({
          first: 2000,
        })).assets;

        let total = data.length;
        let inserted = 0;
        let filesToUpload = []
        for (let i = 0; i < total; i++) {
          const result = await ImageManipulator.manipulateAsync(data[i].uri, [], {base64: true, compress: .5});
          let uri =`data:image/jpeg;base64,${result.base64}`
          console.log(`file name is ${data[i].filename}`)
          filesToUpload.push({
            filename: data[i].filename,
            uri: uri
          })
        }
        //upload files to servers

       let upload =  await post(`/users/photo`, {
          files:filesToUpload
        }).then((response)=>{
            setIsLoading(false);
        }).catch((error)=>{
          console.log('response from error is ',error.toString())
        })
      })();
    }

  const pickImage = async () => {

    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      base64: true
    });




    if (!result.cancelled) {
      //@ts-ignore
      let filename = result.uri.substring(result.uri.lastIndexOf('/') + 1)
      let uri =`data:image/jpeg;base64,${result.base64}`

      let filesToUpload = [];
      filesToUpload.push({
        filename: filename,
        uri: uri
      })
      await post(`/users/photo`, {
        files:filesToUpload
      }).then((response)=>{
        console.log(`response is ${response}`)
      }).catch((error)=>{
        console.log(`error is ${error}`)
      });

      setImage(result.uri);

      setIsLoading(true)
      const newData = [...data];

      newData.unshift(result.uri)
      setData(newData);

      setTimeout(() => {
        setIsLoading(false);
      }, 400);
      }

  };

  const renderItem = ({ item, index }) => (
      <View>
        <Image  style={{width: 400, height: 400}}  source={{uri: item}}  />
      </View>
  );
  // @ts-ignore
  return (
    <View style={styles.container}>
      {isLoading &&
        <View style={styles.loading}>
          <ActivityIndicator animating />
        </View>
      }
      {data.length > 0 && !isLoading &&
          <WineGlass
              data={data}
              renderItem={renderItem}
              bubbleDistance={BUBBLE_SIZE * 1.2}
              bubbleSize={BUBBLE_SIZE}
              sphereRadius={BUBBLE_SIZE * 5}
          />
      }

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={pickImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    height: undefined,
    width: undefined,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    marginLeft: width * 0.4,
    bottom: 0,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
