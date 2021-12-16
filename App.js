import React from 'react';
import firebase from "firebase";
import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createStackNavigator} from "@react-navigation/stack";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from "./components/Home";
import Activities from "./components/BookActivity/Activities";
import ActivitySearch from "./components/BookActivity/ActivitySearch";
import CreateActivity from "./components/BookActivity/CreateActivity";
import MyProfile from "./components/MyProfile/MyProfile";
import MyActivitiesTest2 from "./components/MyBookings/MyActivitiesTest2";
import EventDetails from "./components/BookActivity/EventDetails";

export default function App() {
    //BottomTabNavigator bruges til at lave navigationsbaren i bunden af appen
    //StackNavigatoren bruges til navigationen i appen (fra Home og igennem BookActivity mappen)
    const Tab = createBottomTabNavigator();
    const Stack = createStackNavigator();

    //firebaseConfig bruges til at forbinde med projektet i firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCrCekEtGF0v4jJyd4cV7UkQu4g4nUMH18",
        authDomain: "testproject2-6dae8.firebaseapp.com",
        databaseURL: "https://testproject2-6dae8-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "testproject2-6dae8",
        storageBucket: "testproject2-6dae8.appspot.com",
        messagingSenderId: "925753253686",
        appId: "1:925753253686:web:3813e1a77449c013235d97"
    }

    //Hvis der ikke er forbundet med firebase projektet, så forbind til projektet med ovenstående firebaseConfig.
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    //StackNavigation definerer de screens, som man kan navigere mellem i appen
    //Rækkefølge er ikke ligegyldig.
    const StackNavigation = () => {
        return(
            <Stack.Navigator screenOptions={({route}) => ({headerShown: false})}>
                <Stack.Screen name={"HomePage"} component={Home} />
                <Stack.Screen name={"Activities"} component={Activities} />
                <Stack.Screen name={"ActivitySearch"} component={ActivitySearch} />
                <Stack.Screen name={"CreateActivity"} component={CreateActivity} />
                <Stack.Screen name={"EventDetails"} component={EventDetails} />
            </Stack.Navigator>
        )
    }

        return (
            //NavigationContainer indeholder alt for navigationsbaren.
            <NavigationContainer>
                {/* Tab.Navigator er navigationsbaren. headerShown: false fjerner sidens navn, som ville stå i toppen af den givne screen
                tabBarIcon bestemmer det icon, som ses i navigationsbaren. Icon er valgt efter sidens navn (route.name)*/}
                <Tab.Navigator screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => {
                        if (route.name === 'Home') {
                            return (
                                <Ionicons
                                    name={'home-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                        } else if (route.name === 'My Profile') {
                            return (
                                <Ionicons
                                    name='person-outline'
                                    size={size}
                                    color={color}
                                />
                            );
                        }
                        else{
                            return (
                                <Ionicons
                                    name='basketball-outline'
                                    size={size}
                                    color={color}
                                />
                            );
                        }
                    },
                })}
                               tabBarOptions={{
                                   activeTintColor: "#65b3d4",
                                   inactiveTintColor: 'gray',

                                   labelStyle: {
                                       fontSize: 15,
                                       fontWeight: "bold"
                                   }
                               }}

                >
                    {/* Navigationsbaren består af 3 sider: Home, My Events og My Profile,*/}
                    <Tab.Screen name={"Home"} component={StackNavigation}/>
                    <Tab.Screen name={"My Events"} component={MyActivitiesTest2} />
                    <Tab.Screen name={"My Profile"} component={MyProfile} />
                </Tab.Navigator>
            </NavigationContainer>
        );
}
