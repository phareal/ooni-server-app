import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ActivityIndicator, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import AuthContext from './AuthContext';
import HomeScreen from '../screens/HomeScreen';
import CreatePinCodeScreen from "../screens/CreatePinCode";

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {

  const [ token, setToken ] = React.useState(null);

  React.useEffect(() => {
    (async() => {
      const token = await AsyncStorage.getItem('token');
      setToken(!!token);
    })();
  }, []);

  const login = () => setToken(true);

  const logout = () => setToken(false);

  if(token === null){
    return <ActivityIndicator animating/>
  }

  return (
    <AuthContext.Provider
        value={{
          logout: logout,
          login: login,
        }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ?
            <>
              <Stack.Screen name="Login" component={LoginScreen}/>
              <Stack.Screen name="CreatePinCode" component={CreatePinCodeScreen}/>
              <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} options={{ headerTitle: 'New Account', headerShown: true }} />
            </>
          :
          <Stack.Screen name="Root" component={HomeScreen} />
        }
      </Stack.Navigator>
    </AuthContext.Provider>
  );
}
