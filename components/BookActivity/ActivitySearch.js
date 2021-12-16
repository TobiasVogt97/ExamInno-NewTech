import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {category, days, location, month, year} from "../../hardcodedData";
import SelectDropdown from "react-native-select-dropdown";
import FontAwesome from "react-native-vector-icons/FontAwesome";

//ActivitySearch har til formål at give brugeren mulighed for at foretage en søgning, baseret på sports kategory, lokation og dato.
//Når brugeren har udfyldt søgekriterierne, så vil han/hun blive navigeret til selve søgningen ("Activites" komponenten)
const ActivitySearch = ({route, navigation}) => {
    const today = new Date()
    const [Activitysport, SetSport] = useState('')
    const [Activitylocation, SetLocation] = useState('')
    const [dateDay, setDateDay] = useState(today.getDate())
    const [dateMonth, setDateMonth] = useState(today.getMonth()+1)
    const [dateYear, setDateYear] = useState(today.getFullYear())

        return (
            <View>
                <Text style={styles.header}>Search for Activity</Text>
                <SelectDropdown buttonStyle={styles.dropdown} data={category} onSelect={SetSport} defaultButtonText={"Select sport"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                    return (
                        <FontAwesome
                            name={isOpened ? "chevron-up" : "chevron-down"}
                            color={"#65b3d4"}
                            size={18}
                        />
                    );
                }} dropdownIconPosition={"right"}/>

                <SelectDropdown buttonStyle={styles.dropdown} data={location} onSelect={SetLocation} defaultButtonText={"Select location"} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                    return (
                        <FontAwesome
                            name={isOpened ? "chevron-up" : "chevron-down"}
                            color={"#65b3d4"}
                            size={18}
                        />
                    );
                }} dropdownIconPosition={"right"}/>

                <Text style={styles.dateText}>Select a date</Text>
                <View style={styles.dateTextIndicators}>
                    <Text style={styles.dayText}>Day</Text>
                    <Text style={styles.monthText}>Month</Text>
                    <Text style={styles.yearText}>Year</Text>
                </View>

                <View style={styles.viewRow}>
                    <SelectDropdown buttonStyle={styles.dropdownDay} data={days} onSelect={setDateDay} defaultButtonText={today.getDate()} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                        return (
                            <FontAwesome
                                name={isOpened ? "chevron-up" : "chevron-down"}
                                color={"#65b3d4"}
                                size={18}
                            />
                        );
                    }} dropdownIconPosition={"right"}/>

                    <SelectDropdown buttonStyle={styles.dropdownMonth} data={month} onSelect={setDateMonth} defaultButtonText={today.getMonth()+1} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                        return (
                            <FontAwesome
                                name={isOpened ? "chevron-up" : "chevron-down"}
                                color={"#65b3d4"}
                                size={18}
                            />
                        );
                    }} dropdownIconPosition={"right"}/>

                    <SelectDropdown buttonStyle={styles.dropdownYear} data={year} onSelect={setDateYear} defaultButtonText={today.getFullYear()} buttonTextStyle={styles.dropdownText} dropdownStyle={styles.dropdownDropdownStyle} renderDropdownIcon={(isOpened) => {
                        return (
                            <FontAwesome
                                name={isOpened ? "chevron-up" : "chevron-down"}
                                color={"#65b3d4"}
                                size={18}
                            />
                        );
                    }} dropdownIconPosition={"right"}/>

                </View>
                <TouchableOpacity style={styles.button} onPress={() => {
                    var newDate = dateDay + "-" + dateMonth + "-" + dateYear

                    //Brugeren bliver smidt videre til "Activities" komponenten og sender søgekriterierne med.
                    navigation.navigate('Activities', {sport: Activitysport, location: Activitylocation, date: newDate, parentKey: route.params.parentKey})
                }}>
                    <Text style={styles.buttonText}>Search events</Text>
                </TouchableOpacity>
            </View>
        )
}

export default ActivitySearch

const styles = StyleSheet.create({
    header: {
        textAlign: "center",
        fontSize: 40,
        justifyContent: 'center',
        marginTop: 65,
        color: "#65b3d4"
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
        marginTop: 30,
        marginLeft: 11,
        fontWeight: "bold"
    },
    viewRow: {
        flexDirection: 'row'
    },
    dropdown: {
        width: "95%",
        height: 50,
        backgroundColor: "#FFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#65b3d4",
        margin: 5,
        alignSelf: "center",
        marginTop: 30
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
    dateTextIndicators: {
        flexDirection: 'row',
        marginTop: 10
    },
    dayText: {
        marginLeft: 10,
        marginRight: 60,
        color: "#65b3d4"
    },
    monthText: {
        marginRight: 70,
        color: "#65b3d4"
    },
    yearText: {
        color: "#65b3d4",
    }
});
