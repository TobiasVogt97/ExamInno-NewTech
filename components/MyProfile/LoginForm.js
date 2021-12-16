import React from "react";
import firebase from "firebase";
import {useState} from "react";
import Dialog, {DialogContent} from "react-native-popup-dialog";
import {Button, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";

//LoginForm har til formål at præsentere en login side for brugeren, hvis han/hun ikke er logget ind.
//På loginsiden skal der være mulighed for logge ind eller oprette sig som bruger (hvis man ikke allerede har en bruger)
const LoginForm = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dialog, SetDialog] = useState(false);
    const [createUserFullName, setFullName] = useState('');
    const [createUserAge, setAge] = useState('');
    const [createUserEmail, setUserEmail] = useState('');
    const [createUserPassword, setUserPassword] = useState('');
    const [status, setStatus] = useState("Start");
    console.log(status)

        return(
            <View>
                <Text style={styles.header}>Login</Text>
                <TextInput placeholder={"Email"}
                           value={email} onChangeText={setEmail}
                           style={styles.inputField} placeholderTextColor={"#65b3d4"}/>
                <TextInput placeholder={"Password"} value={password}
                           onChangeText={setPassword}
                           secureTextEntry
                           style={styles.inputField} placeholderTextColor={"#65b3d4"}/>
                <TouchableOpacity style={styles.button} onPress={() => {
                    //Når login knappen trykkes bruges email og password (som brugeren lige har skrevet i ovenstående TextInputs)
                    //til at logge brugeren ind på firebase. Derefter opdateres status for brugeren (alternativ måde at re-render siden
                    // - Skal helst optimeres.. Virker ikkke optimalt)
                    firebase.auth().signInWithEmailAndPassword(email, password)
                    setStatus("LoggedIn")
                }}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                {/*Hvis brugeren ikke er registreret i firebase, så skal en pop-up form vises, hvor brugeren kan registrere sig
                Når brugeren har skrevet brugerinformationerne ind og trykker "Create user", så skal der både oprettes en firebase
                bruger i Authentication (med email og password) og også i realtime databasen med brugerens informationer (navn, alder osv)*/}
                <Button title={"Not registered?"} onPress={() => SetDialog(true)}/>
                <Dialog
                    visible={dialog}
                    onTouchOutside={() => {
                        SetDialog(false);
                    }}
                >
                    <DialogContent>
                        <Text style={styles.header}>Sign up here!</Text>
                        <TextInput style={styles.inputField} placeholder={"Full Name"} value={createUserFullName} onChangeText={setFullName}/>
                        <TextInput style={styles.inputField} placeholder={"Age"} value={createUserAge} onChangeText={setAge}/>
                        <TextInput style={styles.inputField} placeholder={"Email"} value={createUserEmail} onChangeText={setUserEmail}/>
                        <TextInput style={styles.inputField} placeholder={"Password"} value={createUserPassword} onChangeText={setUserPassword} secureTextEntry={true}/>
                        <TouchableOpacity style={styles.button} onPress={() => {
                            try {
                                firebase.auth().createUserWithEmailAndPassword(createUserEmail, createUserPassword).then((userInfo)=>{
                                    const db = firebase.database();
                                    const user = db.ref("users");
                                    const newUser = user.push();
                                    const UserID = userInfo.user.uid.toString();
                                    const User = {
                                        [UserID]:{
                                            fullName: createUserFullName,
                                            age: createUserAge,
                                            email: createUserEmail,
                                            myActivities: [""],
                                            myBookings: [""],
                                            ActivityHistory: [""]
                                        }
                                    }
                                    newUser.set(User);
                                }).then(SetDialog(false));
                            } catch (error){
                                console.log(error)
                            }
                        }}>
                            <Text style={styles.buttonText}>Create User</Text>
                        </TouchableOpacity>
                    </DialogContent>
                </Dialog>
            </View>
        )
}

export default LoginForm

const styles = StyleSheet.create({
    error: {
        color: 'red',
    },
    inputField: {
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
    header: {
        textAlign: "center",
        fontSize: 40,
        justifyContent: 'center',
        marginTop: 35,
        color: "#65b3d4"
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
    }
});