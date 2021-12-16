import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, FlatList, Alert, TouchableOpacity} from 'react-native';
import {Card} from "react-native-paper";
import firebase from "firebase";

//MyActivitiesTest2 har til formål at vise brugeren de events, som han/hun selv har oprettet (myHostings) og de events, som brugeren
//har tilmeldt sig (myBookings). Det skal være muligt at se eventdetaljer, slette egne events og afmelde sig events.
const MyActivitiesTest2 = ({route, navigation}) => {
    const [latestUpdate, setLatestUpdate] = useState("Start");
    const [myHostingIds, setMyHostingIds] = useState([]);
    const [myBookingIds, setMyBookingIds] = useState([]);
    const [myHostings, setMyHostings] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [currentUserParrentId, setCurrentUserParrentId] = useState("");

    //useEffect funktionalitet er beskrevet i Home.js (med eksempel)
    //Denne useEffect resetter ovenstående useState variabler og sætter initialise() igang, hvis var latestUpdate er "Start"
    //Hvis ikke, så console.log'es den seneste opdatering, som bliver sat rundt omkring i koden.
        useEffect(() => {
            if (latestUpdate === "Start") {
                console.log("Resetting variables")
                setLatestUpdate("Resetting variables")
                setMyHostingIds([])
                setMyBookingIds([])
                setMyHostings([])
                setMyBookings([])
                initialise();
            }
            else {
                console.log(latestUpdate)
            }
    })

    //FØRSTE gang man går ind på siden, så skal alt informationen hentes for brugeren.
    //Her sættes useState variablerne også med brugerinformationerne fra firebase (tilmeldte events, hostings og brugerId)
    function initialise() {
            if (firebase.auth().currentUser !== null) {
                const currentUserId = firebase.auth().currentUser.uid;
                const db = firebase.database();
                //Sæt latestUpdate til ny state, så initialise ikke køre næste gang der bliver re-renderet.
                setLatestUpdate("Getting User Data");

                //Hent brugerens informationer i firebase og tilføj til useState variablerne.
                //Brugerens informationer indeholder kun id'er for de oprettede/tilmeldte events.
                db.ref(`/users`).once('value').then(snapshot => {
                    const userArray = Object.entries(snapshot.val());
                    for (var i = 0; i < userArray.length; i++) {
                        if (Object.keys(userArray[i][1])[0] === firebase.auth().currentUser.uid) {
                            setMyHostingIds(userArray[i][1][currentUserId].myActivities);
                            setMyBookingIds(userArray[i][1][currentUserId].myBookings);
                            setCurrentUserParrentId(userArray[i][0]);

                            //Når brugerens data (id'erne) sættes addData funktionen igang, som henter eventinformationerne.
                            //Argumenter som bliver sendt med: Array med hostingID'er, Array med bookingID'er,
                            //2 tomme arrays til behandling af dataen og brugerens parentkey, som firebase selv har genereret.
                            addData(userArray[i][1][currentUserId].myActivities, userArray[i][1][currentUserId].myBookings, [], [], userArray[i][0]);
                            break;
                        }
                    }
                })
            }
    }

    //Tilføj data til det array, som giver siden eventinformationer
    function addData(hostingIds, bookingIds, arrayForHostingData, arrayForBookingData, parentUserKey) {
        const currentUserId = firebase.auth().currentUser.uid;
        const db = firebase.database();

        //Hvis array med ID'erne for de events som brugeren selv hoster ikke er tomt (brugeren har selv oprettet et eller flere events),
        //så hent eventinformationerne og push dem til et arrayForHostingData og opdater useStatevariablen myHostings, som bestemmer
        //elementerne på siden.
            if (hostingIds !== undefined) {
                hostingIds.forEach(function (Ids) {
                    db.ref(`/events/${Ids}`).once('value', (snapshot) => {
                        var key = Object.keys(snapshot.val());

                        arrayForHostingData.push({
                            availableSpots: snapshot.val()[key].availableSpots,
                            parentKey: Ids,
                            key: key[0],
                            name: snapshot.val()[key].name,
                            category: snapshot.val()[key].category,
                            date: snapshot.val()[key].date,
                            description: snapshot.val()[key].description,
                            location: snapshot.val()[key].location,
                            participantNumber: snapshot.val()[key].participantNumber
                        })
                        setMyHostings(arrayForHostingData)
                    });
                })
            }

            //Det samme (som ovenstående for hostingID'erne) gøres for de events, som brugeren har tilmeldt sig.
        // Hvis et event indgår i brugerens liste, som ikke længere indgår i eventlisten, så giv brugeren besked på,
        //at eventet er blevet fjernet (hvis eventet er blevet slettet af begivenhedens host)
            if (bookingIds !== undefined) {
                bookingIds.forEach(function (Ids) {
                    db.ref(`/events/${Ids}`).once('value', (snapshot) => {
                        if (snapshot.val() === null) {
                            var newArray = bookingIds;
                            var index = bookingIds.indexOf(Ids)
                            newArray.splice(index, 1)

                            db.ref(`/users/${parentUserKey}/${currentUserId}/myBookings`).set(newArray);

                            Alert.alert(
                                "Event Deleted",
                                `One of your events has been deleted by its host`,
                                [
                                    {
                                        text: "OK"
                                    }
                                ]
                            );

                        }
                        else {
                            var key = Object.keys(snapshot.val());
                            arrayForBookingData.push({
                                availableSpots: snapshot.val()[key].availableSpots,
                                parentKey: Ids,
                                key: key[0],
                                name: snapshot.val()[key].name,
                                category: snapshot.val()[key].category,
                                date: snapshot.val()[key].date,
                                description: snapshot.val()[key].description,
                                location: snapshot.val()[key].location,
                                participantNumber: snapshot.val()[key].participantNumber
                            })
                            setMyBookings(arrayForBookingData)
                        }
                    });
                })
            }
            //opdater useState variabel med at brugerens data er hentet.
        setLatestUpdate("Data Retrieved")
    }

    //removeHosting() har til formål at slette det givne event, hvis brugern trykker "Delete event" på en af de begivenheder,
    //som han/hun selv har oprettet. Funktionen tager imod et argument, som indeholder indexet på det den begivenhed, som brugeren
    //ønsker slettet. Indexet er events placering i arrayet, f.eks. ["banan", "æble", "citron"] - "banan" vil have index 0, "æble" vil have index 1 osv.
    function removeHosting(item) {
        //Fjern eventet fra My Bookings array, så brugeren ikke kan se det på siden
        const currentUserId = firebase.auth().currentUser.uid;
        const db = firebase.database();
        var eventToBeRemoved = myHostings[item];
        var currentHostings = myHostings;

        currentHostings.splice(item, 1);

        //Fjern event fra hostingID og opdater firebase med det nye array
        var arrayItem = myHostingIds.indexOf(eventToBeRemoved.parentKey);
        myHostingIds.splice(arrayItem, 1);
        db.ref(`/users/${currentUserParrentId}/${currentUserId}/myActivities`).set(myHostingIds);
        db.ref(`/events/${eventToBeRemoved.parentKey}`).remove();

        //Opdater useState variablerne med det nye array og den seneste opdater (hvilket event som er blevet slettet)
        setMyHostings(currentHostings);
        setLatestUpdate("Removed: " + eventToBeRemoved.key);
    }

    //removeBooking() har samme formål som removeHostings(), bortset fra, at det afmelder brugeren fra eventet.
    function removeBooking(item) {
        //Fjern det fra My Bookings siden
        const currentUserId = firebase.auth().currentUser.uid;
        const db = firebase.database();
        var eventToBeRemoved = myBookings[item];
        var currentBookings = myBookings;
        currentBookings.splice(item, 1);

        //Fjern event fra hostingID og opdater firebase
        var arrayItem = myBookingIds.indexOf(eventToBeRemoved.parentKey);
        myBookingIds.splice(arrayItem, 1);
        db.ref(`/users/${currentUserParrentId}/${currentUserId}/myBookings`).set(myBookingIds);

        setMyBookings(currentBookings);
        setLatestUpdate("Removed: " + eventToBeRemoved.key);

        //Eventet opdateres også ved at tilføje en ekstra ledig plads på eventet.
        //Hvis brugeren afmelder sig eventet, så er der jo en plads mere til andre, som vil deltage.
        db.ref(`/events/${eventToBeRemoved.parentKey}/${eventToBeRemoved.key}`)
            .once("value", (snapshot) => {
                db.ref(`/events/${eventToBeRemoved.parentKey}`).child(eventToBeRemoved.key).set({
                    availableSpots: snapshot.val().availableSpots+1,
                    category: snapshot.val().category,
                    date: snapshot.val().date,
                    description: snapshot.val().description,
                    location: snapshot.val().location,
                    name: snapshot.val().name,
                    participantNumber: snapshot.val().participantNumber
                })
        })
    }

    return (
        <ScrollView>
            <Text style={styles.header}>My Hostings</Text>
            <TouchableOpacity style={styles.refresh} onPress={() => {
                setLatestUpdate("Start")
            }}>
                <Text style={styles.refreshText}>Refresh events &#x21bb;</Text>
            </TouchableOpacity>

            <FlatList data={myHostings} renderItem={({item}) =>
                <Card style={styles.card}>
                    <View style={styles.separator}>
                        <Text style={styles.textHeader1}>Event Name: </Text>
                        <Text style={styles.text1}>{item.name}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Location: </Text>
                        <Text style={styles.text}>{item.location}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Date: </Text>
                        <Text style={styles.text}>{item.date}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Spots left: </Text>
                        <Text style={styles.text}>{item.availableSpots}</Text>
                    </View>
                    <View style={styles.separatorButtons}>
                        <TouchableOpacity style={styles.button} onPress={() => {
                            Alert.alert(
                                `${item.name}`,
                                `Date: ${item.date} 
Location: ${item.location} 
Category: ${item.category} 
Participation number: ${item.participantNumber} 
Description: 
${item.description}`,
                                [
                                    {
                                        text: "Close"
                                    }
                                ]
                            );
                        }}>
                            <Text style={styles.buttonText}>View Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonDelete} onPress={() => {
                            var hostingIndex = myHostings.indexOf(item)
                            removeHosting(hostingIndex)
                        }}>
                            <Text style={styles.buttonText}>Delete Event</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            } />

            <Text style={styles.header1}>My Bookings</Text>
            <FlatList data={myBookings} renderItem={({item}) =>
                <Card style={styles.card}>
                    <View style={styles.separator}>
                        <Text style={styles.textHeader1}>Event Name: </Text>
                        <Text style={styles.text1}>{item.name}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Location: </Text>
                        <Text style={styles.text}>{item.location}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Date: </Text>
                        <Text style={styles.text}>{item.date}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Spots left: </Text>
                        <Text style={styles.text}>{item.availableSpots}</Text>
                    </View>
                    <View style={styles.separatorButtons}>
                        <TouchableOpacity style={styles.button} onPress={() => {
                            Alert.alert(
                                `${item.name}`,
                                `Date: ${item.date} 
Location: ${item.location} 
Category: ${item.category} 
Participation number: ${item.participantNumber}
Available spots:  ${item.availableSpots}
Description: 
${item.description}`,
                                [
                                    {
                                        text: "Close"
                                    }
                                ]
                            );
                        }}>
                            <Text style={styles.buttonText}>View Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonLeave} onPress={() => {
                            var bookingIndex = myBookings.indexOf(item)
                            removeBooking(bookingIndex)
                        }}>
                            <Text style={styles.buttonText}>Leave Event</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            } />
        </ScrollView>
    )
}

export default MyActivitiesTest2

const styles = StyleSheet.create({
    refresh: {
        alignSelf: "flex-end",
        marginRight: 10,
        marginTop: 9
    },
    refreshText: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#65b3d4"
    },
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: "white"
    },
    header: {
        textAlign: "center",
        fontSize: 35,
        justifyContent: 'center',
        marginTop: 35,
        color: "#65b3d4"
    },
    header1: {
        textAlign: "center",
        fontSize: 35,
        justifyContent: 'center',
        marginTop: 10,
        color: "#65b3d4"
    },
    flatlist: {
        marginTop: 13,
    },
    card: {
        backgroundColor: "#e6e6e6",
        borderWidth: 1,
        borderColor: "#65b3d4",
        marginLeft: 7,
        marginRight: 7,
        marginTop: 7
    },
    text: {
        fontSize: 18,
        marginTop: 5,
        color: "#5b5b5b"
    },
    textHeader: {
        fontSize: 18,
        marginTop: 5,
        color: "#65b3d4"
    },
    text1: {
        fontSize: 22,
        marginTop: 15,
        color: "#5b5b5b",
        fontWeight: "bold"
    },
    textHeader1: {
        fontSize: 22,
        marginTop: 15,
        color: "#65b3d4",
        fontWeight: "bold"
    },
    button: {
        elevation: 9,
        backgroundColor: "#65b3d4",
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: 115,
        marginBottom: 5,
        marginTop: 10
    },
    buttonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold"
    },
    buttonDelete: {
        elevation: 9,
        backgroundColor: "#a10000",
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: 120,
        marginLeft: 105,
        marginTop: 10,
        marginBottom: 5
    },
    buttonLeave: {
        elevation: 9,
        backgroundColor: "#a10000",
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: 112,
        marginLeft: 113,
        marginTop: 10,
        marginBottom: 5
    },
    separator: {
        flexDirection: 'row',
        textAlign: "left",
        marginLeft: 20
    },
    separator1: {
        flexDirection: 'row',
        textAlign: "left",
        marginLeft: 20
    },
    separatorButtons: {
        flexDirection: 'row',
        marginLeft: 10
    }
});