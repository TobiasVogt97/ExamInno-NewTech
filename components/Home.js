import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, Image} from 'react-native';
import firebase from "firebase";

const HomePage = ({navigation}) => {
    //oprettelse af variabler. firebase.datebase() gemmes i db, så man ikke skal skrive firebase.database() hele tiden...
    //useState bruges som hook. Funktionalitet kan sammenlignes med en variabel som har en metode tilknyttet.
    //f.eks. setCurrentUserParentId("Test"), vil sætte variablen currentUserParentId til "Test".
    const db = firebase.database();
    const [currentUserParentId, setCurrentUserParentId] = useState("");
    const [latestUpdate, setLatestUpdate] = useState("Start");

    //useEffect bruges til at gøre noget hver eneste gang siden bliver rendered. Sker bl.a. ved brug af useState hooket.
    //Hvis setCurrentUserParentId("Test") bruges bliver siden rendered og useEffect kører.
    //Hvis latestUpdate er "Start" (dens initial state), så skal brugerinformationerne hentes
    useEffect(() => {
        if (latestUpdate === "Start") {
            console.log("Initialising")
            userInfo();
        }
        else {
        }
    }, [])

    //Funktion som bruges til at henter brugerens parentID, så det kan passes imellem stackNavigator siderne, så man ikke hele tiden skal hente det.
    //Udfordring: Home render ikke ved brug af tab navigatoren.. Hvis bruger ikke er logget ind, så findes parentID ikke --> Hvis brugeren
    //logger ind efterfølgende og går til Home, så vil userInfo ikke køre igen fordi siden ikke bliver re-renderet.
    function userInfo() {
        if (firebase.auth().currentUser !== null) {
            setLatestUpdate("Getting UserInfo")
            db.ref(`/users`).once('value').then(snapshot => {
                const userArray = Object.entries(snapshot.val());
                for (var i = 0; i < userArray.length; i++) {
                    if (Object.keys(userArray[i][1])[0] === firebase.auth().currentUser.uid) {
                        setCurrentUserParentId(userArray[i][0]);
                    }
                }
            })
        }
    }

    //Returner overskrift (Appens navn), et logo og 2 knapper (TouchableOpacity = Button)
    //Den ene knap skal være navigere til søgning af events (og passe parentId) og den anden skal navigere til CreateActivity (hvor man oprette et event)
    //Brugeren har ikke mulighed for at oprette et event, hvis han/hun ikke er logget ind (Brug af alert)
    return (
        <View style={styles.container}>
            <Text style={styles.header}>PickupSport</Text>
            <Image style={styles.logo} source={require('../Images/sportImage.png')}/>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ActivitySearch', {parentKey: currentUserParentId})}>
                    <Text style={styles.buttonText}>Search for sport event</Text>
                </TouchableOpacity>
            <Text style={styles.or}>Or</Text>
                <TouchableOpacity style={styles.button} onPress={() => {
                    if (firebase.auth().currentUser === null) {
                        Alert.alert(
                            "Create Event Error",
                            "To create an event you must be logged in. You can login or create a user under 'My Profile'",
                            [
                                {
                                    text: "OK"
                                }
                            ]
                        );
                    }
                    else {
                        navigation.navigate('CreateActivity')
                    }
                }}>
                    <Text style={styles.buttonText}>Create sport event</Text>
                </TouchableOpacity>
        </View>
    )
}

export default HomePage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: "white"
    },
    header: {
        textAlign: "center",
        fontSize: 40,
        justifyContent: 'center',
        marginTop: 100,
        color: "#65b3d4"
    },
    logo: {
        alignSelf: "center",
        resizeMode: "contain",
        height: 100,
        marginTop: 30,
        marginBottom: 70
    },
    text: {
        textAlign: "center",
        fontSize: 15,
        justifyContent: 'center'
    },
    button: {
        elevation: 9,
        backgroundColor: "#65b3d4",
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 30,
        width: 300,
        alignSelf: "center"
    },
    buttonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    },
    or: {
        alignSelf: "center",
        marginTop: 30,
        textTransform: "uppercase",
        fontSize: 18,
        fontWeight: "bold",
        color: "#6c6c6c"
    }
});