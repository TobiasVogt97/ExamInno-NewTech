import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import firebase from "firebase";

//EventDetails har til formål at præsentere eventinformatiorne for brugeren. Afhængig af om brugeren har oprettet eventet,
//allerede deltager, eller om der er plads på eventet, skal brugeren kunne enten slette, forlade eller deltage i eventet.
//Hvis der ikke er plads på eventet, så dette fremgå.
const EventDetails = ({route, navigation}) => {
    const [bookingArray, setBookingsArray] = useState([]);
    const eventDetails = route.params.item.event;
    const [parentKey, setCurrentUserParentId] = useState(route.params.userParentKey);
    const [latestUpdate, setLatestUpdate] = useState("Start");
    const [buttonStatus, setButtonStatus] = useState("Participate");
    const [eventParrentKey, setEventParentKey] = useState(route.params.item.parentKey);

    //Hvis siden bliver renderet og latestUpdate er "Start", så skal userCheck() køres.
    //Ellers console.log den seneste opdatering
    useEffect(() => {
        if (latestUpdate === "Start") {
            console.log("Initialising")
            userCheck(route.params.userParentKey)
        }
        else {
            console.log(latestUpdate)
        }
    })

    //userCheck() har til formål at hente brugerens parentID, som skal bruges når der skal undersøges brugerens
    //muligheder i participationCheck(). Hvis brugerens parentkey er modtaget fra tidligere sider, så køres participation med den.
    function userCheck(userParentKey) {
        setLatestUpdate("UserCheck")
        if (userParentKey === "") {
            var db = firebase.database();
                db.ref(`/users`).once('value').then(snapshot => {
                    const userArray = Object.entries(snapshot.val());
                    for (var i = 0; i < userArray.length; i++) {
                        if (Object.keys(userArray[i][1])[0] === firebase.auth().currentUser.uid) {
                            setCurrentUserParentId(userArray[i][0]);
                            participationCheck(userArray[i][0], eventDetails.availableSpots)
                            break;
                        }
                    }
                })
        }
        else {
            participationCheck(parentKey, eventDetails.availableSpots)
        }
    }

    //participationCheck() har til formål at undersøge brugerens muligheder. Hvis der er plads på eventet, og brugeren ikke er host eller
    //deltager i eventet, så skal "Participate" fremgå nederst, som en mulighed. Hvis brugeren er host af eventet, så skal "Delete event" fremgå.
    //Hvis brugeren allerede deltager i eventet skal "Leave event" fremgå og hvis der ikke er plads på eventet skal "No available spots" fremgå
    function participationCheck(userKey, availableSpots) {
        if (firebase.auth().currentUser !== null) {
            setLatestUpdate("Starting participation Check")

            const db = firebase.database();
            const currentUser = firebase.auth().currentUser.uid;

            db.ref(`/users/${userKey}/${currentUser}`).on("value", snapshot => {
                if (snapshot.val().myBookings !== undefined) {
                    var userbookings = snapshot.val().myBookings;
                }
                if (buttonStatus === "Participate" && availableSpots === 0) {
                    setButtonStatus("No Spots Available")
                }
                if (userbookings !== undefined) {
                    setBookingsArray(userbookings);

                    if (userbookings.includes(eventParrentKey)) {
                        setButtonStatus("Leave Event")
                    }
                }

                var userHostings = snapshot.val().myActivities;
                if (userHostings !== undefined) {
                    if (userHostings.includes(eventParrentKey)) {
                        setButtonStatus("Delete Event")
                    }
                }
            })
        }
    }

    //participateEvent() har til formål at registrere i databasen, at brugeren deltager i eventet.
    //funktionen skal både registrere det i brugerens informationer i databasen og i eventets informationer (Der skal være plads til 1 mindre)
    //Når brugeren har meldt sig på eventet, skal han/hun navigeres til Home, og bør nu kunne se det nye event i "My Events", hvis brugeren
    //refresher events i højre hjørne.
    function participateEvent() {
        if (firebase.auth().currentUser !== null) {
            firebase.database().ref(`/users/${parentKey}/${firebase.auth().currentUser.uid}/myBookings`)
                .once("value", snapshot => {
                    var newSnapShot;
                    if (snapshot.val() === null) {
                        newSnapShot = "";
                    }
                    else {
                        newSnapShot = snapshot.val()[0]
                    }
                    //Hvis newSnapShot === "", betyder det at brugeren ikke har meldt sig på nogen hold endnu. Eventets id
                    //skal dermed gemmes i et array og gemmes i brugeres informationer i databasen.
                    if (newSnapShot === "") {
                        firebase.database().ref(`/users/${parentKey}/${firebase.auth().currentUser.uid}/myBookings`)
                            .set([eventParrentKey]).then(() => {
                            var eventName = eventDetails.category + "_" + eventDetails.location + "_" + eventDetails.date
                            //"Available spots" på eventet i databasen skal opdateres, nu da brugeren også deltager.
                            firebase.database().ref(`/events/${eventParrentKey}/${eventName}`).update({
                                availableSpots: eventDetails.availableSpots-1,
                                category: eventDetails.category,
                                date: eventDetails.date,
                                description: eventDetails.description,
                                location: eventDetails.location,
                                name: eventDetails.name,
                                participantNumber: eventDetails.participantNumber
                            })
                        })
                        //Brugeren får en bekræftelse på tilmeldingen.
                        Alert.alert(
                            "Event joined",
                            `You have joined the event ${eventDetails.name}. The event will appear under "My bookings". If the event does not appear, try clicking the "Refresh events" in the top right corner`,
                            [
                                {
                                    text: "OK"
                                }
                            ]
                        );
                        //Brugeren navigeres til Home og latestUpdate variablen.
                        navigation.navigate("HomePage");
                        setLatestUpdate("Event Added");
                        //Forsøg på at render siden igen, hvis brugeren går ind på eventet igen..
                        //Forbedringsmuligheder her...
                        setLatestUpdate("Start");
                    }
                    else {
                        //Hvis brugeren allerede deltager i et eller flere events, så skal det nye event blot pushes til arrayet med
                        //eventID'erne og derefter sættes ind på brugerens information i databasen.
                        var myBookingsArray = snapshot.val();
                        myBookingsArray.push(eventParrentKey)
                        firebase.database().ref(`/users/${parentKey}/${firebase.auth().currentUser.uid}/myBookings`)
                            .set(myBookingsArray).then(() => {
                            var eventName = eventDetails.category + "_" + eventDetails.location + "_" + eventDetails.date
                            //På samme måde her skal eventet opdateres ved at registrere, at der er 1 plads mindre på eventet.
                            firebase.database().ref(`/events/${eventParrentKey}/${eventName}`).update({
                                availableSpots: eventDetails.availableSpots-1,
                                category: eventDetails.category,
                                date: eventDetails.date,
                                description: eventDetails.description,
                                location: eventDetails.location,
                                name: eventDetails.name,
                                participantNumber: eventDetails.participantNumber
                            })
                        })
                        //Brugeren får en bekræftelse på tilmeldingen.
                        Alert.alert(
                            "Event joined",
                            `You have joined the event ${eventDetails.name}. The event will appear under "My bookings"`,
                            [
                                {
                                    text: "OK"
                                }
                            ]
                        );
                        //Brugeren navigeres til Home og latestUpdate variablen.
                        navigation.navigate("HomePage");
                        setLatestUpdate("Event Added");
                        //Forsøg på at render siden igen, hvis brugeren går ind på eventet igen..
                        //Forbedringsmuligheder her...
                        setLatestUpdate("Start");
                    }

            })

        }
        else {
            //Hvis brugeren ikke er logget ind så kan han/hun ikke deltage i eventet. Denne tilføjelse har været en nødvendighed
            //da brugeren ikke ville kunne afmelde sig eventet (hvis brugeren ikke har nogen profil i databasen, så kan vi ikke
            //se hvilke events som brugeren deltager i).
                Alert.alert(
                    "Error",
                    "To participate in events, you must create a user. You can do this under 'My Profile'",
                    [
                        {
                            text: "OK"
                        }
                    ]
                );
        }
    }

    //leaveEvent() har til formål at afmelde brugeren fra holder. Funktionen skal derfor fjerne event id'et fra brugerens informationer
    //i databasen og derefter opdatere eventet, da der kan være 1 til på eventet.
    function leaveEvent() {
        //brugerens deltagelses array hentes og myBookings arrayet redigeres (fjerner eventID'et som mathcer det givne event)
        //og databasen opdateres.
        firebase.database().ref(`/users/${parentKey}/${firebase.auth().currentUser.uid}/myBookings`)
            .once("value", snapshot => {
                var newArray = snapshot.val()
                var index = newArray.indexOf(eventParrentKey);
                newArray.splice(index, 1)

                firebase.database().ref(`/users/${parentKey}/${firebase.auth().currentUser.uid}/myBookings`)
                    .set(newArray)
            }).then(() => {
            var eventName = eventDetails.category + "_" + eventDetails.location + "_" + eventDetails.date
            //eventet opdateres ved at tilføje 1 til plads, nu da der er 1 mindre, som deltager.
                firebase.database().ref(`/events/${eventParrentKey}/${eventName}`).update({
                    availableSpots: eventDetails.availableSpots+1,
                    category: eventDetails.category,
                    date: eventDetails.date,
                    description: eventDetails.description,
                    location: eventDetails.location,
                    name: eventDetails.name,
                    participantNumber: eventDetails.participantNumber
                })
        })
        //Brugeren får en bekræftelse på afmeldingen.
        Alert.alert(
            "Event Unsubscribed",
            `You have left the event ${eventDetails.name}`,
            [
                {
                    text: "OK"
                }
            ]
        );
        //Brugeren navigeres til Home og latestUpdate variablen.
        navigation.navigate("HomePage");
        setLatestUpdate("Event left");
        //Forsøg på at render siden igen, hvis brugeren går ind på eventet igen..
        //Forbedringsmuligheder her...
        setLatestUpdate("Start");
    }

    //deleteEvent() har til formål at slette eventet fra databasen. Derudover skal det også slette eventet fra det array i databasen
    //som inderholder de events brugeren har oprettet.
    function deleteEvent() {
        //Brugerens hosting array hentes og det givne event fjernes. Derefter opdateres databasen med det nye array.
        firebase.database().ref(`/users/${parentKey}/${firebase.auth().currentUser.uid}/myActivities`)
            .once("value", snapshot => {
                var newArray = snapshot.val()
                var index = newArray.indexOf(eventParrentKey);
                newArray.splice(index, 1)
                firebase.database().ref(`/users/${parentKey}/${firebase.auth().currentUser.uid}/myActivities`).set(newArray);
            }).then(() => {
                //Eventet fjernes fra databasen
            firebase.database().ref(`/events/${eventParrentKey}`).remove();
        })
        //Brugeren får en bekræftelse på afmeldingen.
        Alert.alert(
            "Event Deleted",
            `You have deleted the event ${eventDetails.name}`,
            [
                {
                    text: "OK"
                }
            ]
        );
        //Brugeren navigeres til Home og latestUpdate variablen.
        navigation.navigate("HomePage");
        setLatestUpdate("Event Deleted");
        //Forsøg på at render siden igen, hvis brugeren går ind på eventet igen..
        //Forbedringsmuligheder her...
        setLatestUpdate("Start");
    }

    return (
        <View>
            <Text style={styles.header}>{eventDetails.name}</Text>
            <View style={styles.separator}>
                <Text style={styles.textHeader}>Location: </Text>
                <Text style={styles.text}>{eventDetails.location}</Text>
            </View>
            <View style={styles.separator}>
                <Text style={styles.textHeader}>Date: </Text>
                <Text style={styles.text}>{eventDetails.date}</Text>
            </View>
            <View style={styles.separator}>
                <Text style={styles.textHeader}>Activity: </Text>
                <Text style={styles.text}>{eventDetails.category}</Text>
            </View>
            <View style={styles.separator}>
                <Text style={styles.textHeader}>Spots left on the event: </Text>
                <Text style={styles.text}>{eventDetails.availableSpots}</Text>
            </View>
            <Text style={styles.textHeader}>Description: </Text>
            <Text style={styles.description}>{eventDetails.description}</Text>

            <TouchableOpacity style={styles.button} onPress={() => {
                if (buttonStatus === "Participate") {
                    participateEvent()
                } else {
                    if (buttonStatus === "Leave Event") {
                        console.log("her")
                        leaveEvent()
                    }
                    else {
                        if (buttonStatus === "Delete Event") {
                            deleteEvent()
                        }
                        else {
                            if (buttonStatus === "No Spots Available") {
                                Alert.alert(
                                    "No Spots Available",
                                    "Unfortunately, there are no spots left on this event",
                                    [
                                        {
                                            text: "OK"
                                        }
                                    ]
                                );
                            }
                        }
                    }
                }
            }}>
                <Text style={styles.buttonText}>{buttonStatus}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => {navigation.goBack()}}>
                <Text style={styles.backButtonText}>&#8592; Go Back</Text>
            </TouchableOpacity>
        </View>
    )
}

export default EventDetails

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
        marginTop: 50,
        color: "#65b3d4"
    },
    textHeader: {
        textAlign: "center",
        fontSize: 25,
        marginTop: 15,
        justifyContent: 'center',
        color: "#65b3d4"
    },
    text: {
        textAlign: "center",
        fontSize: 25,
        marginTop: 15,
        justifyContent: 'center',
        color: "#5b5b5b"
    },
    description: {
        textAlign: "center",
        fontSize: 20,
        marginTop: 15,
        justifyContent: 'center',
        color: "#5b5b5b",
        marginLeft: 10,
        marginRight: 10
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
    separator: {
        flexDirection: 'row',
        alignSelf: "center"
    },
    backButton: {
        marginTop: 25,
        marginLeft: 20
    },
    backButtonText: {
        fontSize: 18,
        color: "#65b3d4",
        fontWeight: "bold"
    }
});