import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import firebase from "firebase";
import {Card} from "react-native-paper";

//Activites har til formål at vise de events, som matcher de søgekriterier, som brugeren har sat i "ActivitySearch" komponenten
//Brugeren skal have mulighed for at se alle eventinformationerne, hvis han/hun trykker på "Show details" knappen.
//Hvis brugeren trykker på "Show Details", skal han/hun blive navigeret til "EventDetails" komponenten
const Activities = ({route, navigation}) => {
    const db = firebase.database();
    const [events, setEvents] = useState([]);
    const [latestUpdate, setLatestUpdate] = useState("Start")

    //Hvis siden bliver renderet og latestUpdate er "Start", så skal alle initialise() køres.
    //Hvis de events, som matcher brugerens søgekriterier, allerede er hentet, så er latestUpdate ikke "Start", og appen skal ikke gøre
    //yderligere
    useEffect(() => {
                if (latestUpdate === "Start") {
                    console.log("Initialising")
                    initialise();
                }
                else {
                }
        })

    //initialise() opdaterer først latestUpdate useState variablen, så initialise() ikke kører hver eneste gang siden bliver renderet.
    //Når alle events er hentet i initialise(), så startes searchEvents() funktionen, som tager imod 3 argumenter: route.Params (søgekriterierne),
    //allEvents (ParentID på alle events i databasen) og et tomt array
    function initialise() {
                   setLatestUpdate("Getting User Data");
                   db.ref("/events").on('value', snapshot => {
                       const allEvents = Object.entries(snapshot.val());
                           searchEvents(route.params, allEvents, [])
                   })
    }

    //searchEvents() har til formål at hente event informationerne på alle de events, som matcher den søgning brugeren har foretaget
    function searchEvents(searchCriteria, allEvents, arrayData) {
        allEvents.forEach(function (event) {
            var eventKey = Object.keys(event[1])
            //Hvis søgekriterierne matcher eventet, så skal eventets informationer pushes til det tomme array
            if (eventKey[0].includes(searchCriteria.sport) && eventKey[0].includes(searchCriteria.location) && eventKey[0].includes(searchCriteria.date)) {
                arrayData.push(
                    {
                        parentKey: event[0],
                        event: event[1][eventKey]
                    }
                )
            }
            setEvents(arrayData)
        })
        setLatestUpdate("Events Retrieved")
    }

    //Returner de events, som er blevet tilføjet til "events" array i searchEvents() (ovenstående funktion)
    return (
        <ScrollView>
            <Text style={styles.header}>{route.params.sport} Events</Text>
            <FlatList style={styles.flatlist} data={events} renderItem={({item}) =>
                <Card style={styles.card}>
                    <View style={styles.separator}>
                        <Text style={styles.textHeader1}>Event Name: </Text>
                        <Text style={styles.text1}>{item.event.name}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Location: </Text>
                        <Text style={styles.text}>{item.event.location}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Date: </Text>
                        <Text style={styles.text}>{item.event.date}</Text>
                    </View>
                    <View style={styles.separator1}>
                        <Text style={styles.textHeader}>Available spots: </Text>
                        <Text style={styles.text}>{item.event.availableSpots}</Text>
                        <TouchableOpacity style={styles.button} onPress={() => {
                            navigation.navigate("EventDetails", {item: item, userParentKey: route.params.parentKey})
                        }}>
                            <Text style={styles.buttonText}>View Event</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            } />
        </ScrollView>
    )
}

export default Activities

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
        marginTop: 35,
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
        width: 107,
        alignSelf: "center",
        marginLeft: 100,
        marginBottom: 10
    },
    buttonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold"
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
    }
});