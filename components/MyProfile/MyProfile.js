import React, {useState, useEffect} from 'react';
import {Card} from "react-native-paper";
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import firebase from "firebase";
import LoginForm from "./LoginForm";

//MyProfile har til formål at vise brugerens informationer og give muligheden for at logge ud af sin bruger.
//Hvis brugeren ikke er logget ind, så bliver LoginForm komponenten vist, og brugeren har mulighed for at logge ind eller oprette en bruger.
const MyProfile = ({navigation}) => {
    const [user, setUser] = useState({ loggedIn: false });

    //Ved ændringer i firebase.auth() så opdater ovenstående useState variabel.
    //firebase.auth() ændres når en bruger enten logger ind eller logger ud.
    //funktionen tager imod en callback funktion som argument, som er useState funktionaliteten (setUser)
    function onAuthStateChange(callback) {
        return firebase.auth().onAuthStateChanged(user => {
            if (user) {
                callback({loggedIn: true, user: user});
            } else {
                callback({loggedIn: false});
            }
        });
    }

    //Hver eneste gang siden bliver renderet kører ovenstående funktion
    useEffect(() => {
        const unsubscribe = onAuthStateChange(setUser);
        return () => {
            unsubscribe();
        };
    }, []);

    //Hvis brugeren ikke er logget ind, eller ikke har en bruger, så skal nedenstående Guestpage bruges som template.
    //Templaten bruges længere nede koden.
    const GuestPage = () => {
        return(
            <View style={styles.container}>
                <Text style={styles.paragraph}>
                    Login or create a new user
                </Text>
                <Card style={{padding:20}}>
                    <LoginForm />
                </Card>
            </View>
        )
    }

    //Hvis brugeren er logget ind, så skal brugerens informationer vises på siden og brugeren skal have mulighed for at logge ud.
    if (user.loggedIn === true) {
        //Få mail på den bruger, som er logget ind. Derefter find en bruger i databasen med matchende mail.
        const loggedInUserEmail = {user}.user.user.uid;
        const db = firebase.database();
        var userArray;
        var userFullName;
        var userAge;
        var userEmail;

        if (!userArray) {
            db.ref('users').on('value', snapshot => {
                userArray = Object.entries(snapshot.val());
                for (var i = 0; i <userArray.length; i++) {
                    if (Object.keys(userArray[i][1])[0] === loggedInUserEmail) {
                        userFullName = userArray[i][1][loggedInUserEmail].fullName
                        userAge = userArray[i][1][loggedInUserEmail].age
                        userEmail = userArray[i][1][loggedInUserEmail].email

                    }
                }
            }, () => console.log("Something went wrong"))
        }

        //Returner brugerens informationer.
        //Udfordring: Det er ikke altid, at brugerens informationer bliver hentet (hvis siden ikke bliver renderet?)
            return (
                <View>
                    <Text style={styles.header}>My Profile</Text>
                    <View style={styles.separator}>
                        <Text style={styles.text}>Name of user: </Text>
                        <Text style={styles.text1}>{userFullName}</Text>
                    </View>
                    <View style={styles.separator}>
                        <Text style={styles.text}>Age: </Text>
                        <Text style={styles.text1}>{userAge}</Text>
                    </View>
                    <View style={styles.separator}>
                        <Text style={styles.text}>Email: </Text>
                        <Text style={styles.text1}>{userEmail}</Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => {
                        firebase.auth().signOut()
                    }}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    else {
        //Returner gæstesiden, som indeholder LoginForm, og hvor brugeren også har mulighed for at oprette sig
        return(
            <GuestPage />
            )
    }
}

export default MyProfile


const styles = StyleSheet.create({
    header: {
        textAlign: "center",
        fontSize: 40,
        justifyContent: 'center',
        marginTop: 35,
        color: "#65b3d4"
    },
    text: {
        fontSize: 25,
        marginTop: 5,
        color: "#65b3d4"
    },
    text1: {
        fontSize: 23,
        marginTop: 5,
        color: "#5b5b5b"
    },
    button: {
        elevation: 9,
        backgroundColor: "#65b3d4",
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 10,
        marginBottom: 10,
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
    separator: {
        flexDirection: 'row',
        alignSelf: "center"
    },
    paragraph: {
        textAlign: "center",
        fontSize: 35,
        justifyContent: 'center',
        marginTop: 125,
        color: "#65b3d4"
    }
});
