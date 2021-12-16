import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Button} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import Dialog, {DialogContent} from "react-native-popup-dialog";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import firebase from "firebase";
import {location} from "../../hardcodedData";
import {dropDownNumbers} from "../../hardcodedData";
import {category} from "../../hardcodedData";
import {days} from "../../hardcodedData";
import {month} from "../../hardcodedData";
import {year} from "../../hardcodedData";

//createActivity har til formål at give brugeren mulighed for at oprette et event.
//events informationer skal angives is text felter og drop downs. Når brugeren har oprettet et event, skal det kunne ses i
//"My events" (tab navigatoren i bunden)
const createActivity = ({navigation}) => {
    const currentDate = new Date()
    const db = firebase.database();
    const [createEventName, SetName] = useState("");
    const [latestUpdate, setUpdate] = useState("Start");
    const [createActivityCategory, SetCategory] = useState("");
    const [createLocation, SetLocation] = useState("");
    const [createParticipantNumber, SetNumber] = useState(1);
    const [createActivityDate, SetDate] = useState(currentDate.getDate() + '-' + currentDate.getMonth()+1 + '-' + currentDate.getFullYear());
    const [createDescription, SetDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [dialog, SetDialog] = useState(false);
    const [currentUserParentId, setCurrentUserParentId] = useState("");
    const [dateDay, setDateDay] = useState(currentDate.getDay());
    const [dateMonth, setDateMonth] = useState(currentDate.getMonth());
    const [dateYear, setDateYear] = useState(currentDate.getFullYear());

    //Når siden bliver renderet og latestUpdate er "Start" (Hvis brugerens parentID ikke er hentet endnu), så start getUserInfo()
    useEffect(() => {
        if (latestUpdate === "Start") {
            console.log("Getting UserInfo")
            getUserInfo();
        }
        else {
        }
    })

    //getUserInfo() har til formål at hente brugerens parentID, som skal bruges, når der oprettes et event, da eventets id skal
    //tilføjes til brugerens hosting array. latestUpdate sættes også her, så brugerens parentID ikke hentes hver gang siden render.
    function getUserInfo() {
        db.ref(`/users`).once('value').then(snapshot => {
            const userArray = Object.entries(snapshot.val());
            for (var i = 0; i < userArray.length; i++) {
                if (Object.keys(userArray[i][1])[0] === firebase.auth().currentUser.uid) {
                    setCurrentUserParentId(userArray[i][0]);
                    setUpdate("Data Retrieved")
                    break;
                }
            }
        })
    }


    return (
        <View>
            {/*Dialog vises når man trykker "Create Event". På dialogen skal brugeren bekæfte eventinformationerne.
            Hvis brugeren bekræfter vil eventet bliver tilføjet i eventlisten i databasen og eventets id vil blive
            tilføjet til brugerens hosting array*/}
            <Dialog
                visible={dialog}
                onTouchOutside={() => {
                    SetDialog(false);
                }}
            >
                <DialogContent>
                    <Text>Event Detail Confirmation!</Text>
                    <Text>Create event with the following details:</Text>
                    <Text>Name: {createEventName}</Text>
                    <Text>Activity: {createActivityCategory}</Text>
                    <Text>Location: {createLocation}</Text>
                    <Text>Number of participants: {createParticipantNumber}</Text>
                    <Text>Available spots: {createParticipantNumber-1}</Text>
                    <Text>Date: {createActivityDate}</Text>
                    <Text>Description: {createDescription}</Text>
                    <Button title={"Cancel"} onPress={() => {SetDialog(false)}}/>
                    <Button title={"Confirm"} onPress={() => {
                        try {
                            const eventId = createActivityCategory + "_" + createLocation + "_" + createActivityDate;
                            const eventDetails = { [eventId]:{
                                    name: createEventName,
                                    category: createActivityCategory,
                                    location: createLocation,
                                    participantNumber: createParticipantNumber,
                                    date: createActivityDate,
                                    description: createDescription,
                                    availableSpots: createParticipantNumber-1
                                }
                            }
                            //Opdater events i firebase og tilføj eventId'et til myActivities for brugeren ("MyActivities") er
                            //array med de events brugeren hoster
                            db.ref("/events").push(eventDetails).then((event) => {
                                db.ref(`/users/${currentUserParentId}/${firebase.auth().currentUser.uid}/myActivities`).once("value")
                                    .then((data) => {
                                        //Hvis data.val() er null, så betyder det, at brugeren ikke har oprettet nogen events endnu
                                        if (data.val() !== null) {
                                            var array = Object.entries(data.val());
                                            var newArray = [];
                                            for (var i = 0; i < Object.entries(data.val()).length; i++) {
                                                newArray.push(array[i][1])
                                            }
                                            newArray.push(event.key)
                                            db.ref(`/users/${currentUserParentId}/${firebase.auth().currentUser.uid}/myActivities`).set(newArray)
                                        }
                                        //Hvis brugeren ikke hoster nogen events, så skal det nye event pushes til et tomt array og tilføjes
                                            //til brugerens information i databasen.
                                        else {
                                            var firstArray = [];
                                            firstArray.push(event.key)
                                            db.ref(`/users/${currentUserParentId}/${firebase.auth().currentUser.uid}/myActivities`).set(firstArray)
                                        }
                                })
                            })
                            //når eventet created, så får brugeren en bekræftelse og der bliver navigeret tilbage til Home.
                            SetDialog(false);
                            Alert.alert(
                                "Event Confirmation",
                                "Event is created. You should be able to see it under 'My Events'",
                                [
                                    {
                                        text: "OK"
                                    }
                                ]
                            );
                            navigation.navigate("HomePage")
                        }
                        catch (error){
                            setErrorMessage(error.message)
                            console.log(errorMessage)
                        }
                    }}/>
                </DialogContent>
            </Dialog>

            <Text style={styles.header}>Create a sport event</Text>
            <TextInput style={styles.textInput} placeholder={"Name of Event"} onChangeText={SetName} placeholderTextColor={"#65b3d4"} />

            {/*SelectDropdown er dropdowns, hvor brugeren kan vælge sport, lokation, hvor mange der kan være på eventet, dato osv.*/}
            <SelectDropdown buttonStyle={styles.dropdown} data={category} onSelect={SetCategory} defaultButtonText={"Select sport"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                return (
                    <FontAwesome
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        color={"#65b3d4"}
                        size={18}
                    />
                );
            }}
                            dropdownIconPosition={"right"}/>
            <SelectDropdown buttonStyle={styles.dropdown} data={location} onSelect={SetLocation} defaultButtonText={"Select location"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                return (
                    <FontAwesome
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        color={"#65b3d4"}
                        size={18}
                    />
                );
            }}
                            dropdownIconPosition={"right"}/>
            <SelectDropdown buttonStyle={styles.dropdown} data={dropDownNumbers} onSelect={SetNumber} defaultButtonText={"Select no. of participants"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                return (
                    <FontAwesome
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        color={"#65b3d4"}
                        size={18}
                    />
                );
            }}
                            dropdownIconPosition={"right"}/>

            <Text style={styles.dateText}>Select date of event</Text>
            <View style={styles.viewRow}>
                <SelectDropdown buttonStyle={styles.dropdownDay} data={days} onSelect={setDateDay} defaultButtonText={"Day"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                    return (
                        <FontAwesome
                            name={isOpened ? "chevron-up" : "chevron-down"}
                            color={"#65b3d4"}
                            size={18}
                        />
                    );
                }}
                                dropdownIconPosition={"right"}/>

                <SelectDropdown buttonStyle={styles.dropdownMonth} data={month} onSelect={setDateMonth} defaultButtonText={"Month"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                    return (
                        <FontAwesome
                            name={isOpened ? "chevron-up" : "chevron-down"}
                            color={"#65b3d4"}
                            size={18}
                        />
                    );
                }}
                                dropdownIconPosition={"right"}/>
                <SelectDropdown buttonStyle={styles.dropdownYear} data={year} onSelect={setDateYear} defaultButtonText={"Year"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                    return (
                        <FontAwesome
                            name={isOpened ? "chevron-up" : "chevron-down"}
                            color={"#65b3d4"}
                            size={18}
                        />
                    );
                }}
                                dropdownIconPosition={"right"}/>
            </View>

                <TextInput style={styles.description} placeholder={"Description"} onChangeText={SetDescription} placeholderTextColor={"#65b3d4"}/>
            {/*TouchableOpacity er en button. Når knappen trykkes, så bliver der genereret en ny dato, som bliver events key i firebase
            //Events key har også en parentkey, som firebase selv laver..*/}
            <TouchableOpacity style={styles.button} onPress={() => {
                var newDate = dateDay + "-" + dateMonth + "-" + dateYear
                SetDate(newDate)
                SetDialog(true)
            }}>
                <Text style={styles.buttonText}>Create Event</Text>
            </TouchableOpacity>

        </View>
    )
}

export default createActivity

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
        marginTop: 65,
        color: "#65b3d4"
    },
    textInput: {
        width: "95%",
        height: 50,
        backgroundColor: "#FFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#65b3d4",
        margin: 5,
        alignSelf: "center",
        marginTop: 20,
        fontWeight: "bold",
        fontSize: 17,
        color: "#65b3d4",
        paddingLeft: 15
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
        marginTop: 10,
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
    description: {
        width: "95%",
        height: 120,
        backgroundColor: "#FFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#65b3d4",
        margin: 5,
        alignSelf: "center",
        fontWeight: "bold",
        fontSize: 17,
        color: "#65b3d4",
        paddingLeft: 15,
        textAlignVertical: 'top'
    },
    datepicker: {
        width: "95%",
        marginTop: 15,
        alignSelf: "center",

    },
    dropdown: {
        width: "95%",
        height: 50,
        backgroundColor: "#FFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#65b3d4",
        margin: 5,
        alignSelf: "center"
    },
    dropdownText: {
        color: "#65b3d4",
        textAlign: "left",
        fontWeight: "bold",
        fontSize: 15
    },
    dropdownDropdownStyle: {
        backgroundColor: "#EFEFEF"
    },
    dropdownDay: {
        width: 85
    },
    dropdownMonth: {
        width: 105
    },
    dropdownYear: {
        width: 95
    },
    dateText: {
        color: "#65b3d4",
        marginTop: 9,
        marginLeft: 11
    },
    viewRow: {
        flexDirection: 'row'
    }
});