// noinspection TypeScriptValidateTypes

import AsyncStorage from '@react-native-async-storage/async-storage';
const URL_API = "http://app-d4a2d7d4-8456-462b-b304-e15aa00a1895.cleverapps.io";

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
