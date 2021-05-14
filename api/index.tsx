// noinspection TypeScriptValidateTypes

import AsyncStorage from '@react-native-async-storage/async-storage';
const URL_API_ = "https://ooni-api.herokuapp.com";
const URL_API = "http://localhost:5000";

export async function post(uri: string, options:any) {

  const response = await fetch(`${URL_API}${uri}`,options);
  const responseJson = await response.json();
  return responseJson.status === 'OK' ? responseJson.data : false;
}

export async function get(uri: string ) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${URL_API}${uri}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
    method: 'GET',
  });
  const responseJson = await response.json();
  console.log(`response is ${JSON.stringify(responseJson)}`)
  return responseJson.status === 'OK' ? responseJson.data : false;
}
