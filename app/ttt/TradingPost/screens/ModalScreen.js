"use strict";
exports.__esModule = true;
var expo_status_bar_1 = require("expo-status-bar");
var react_native_1 = require("react-native");
var EditScreenInfo_1 = require("../components/EditScreenInfo");
var Themed_1 = require("../components/Themed");
function ModalScreen() {
    return (<Themed_1.View style={styles.container}>
      <Themed_1.Text style={styles.title}>Modal</Themed_1.Text>
      <Themed_1.View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>
      <EditScreenInfo_1["default"] path="/screens/ModalScreen.tsx"/>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <expo_status_bar_1.StatusBar style={react_native_1.Platform.OS === 'ios' ? 'light' : 'auto'}/>
    </Themed_1.View>);
}
exports["default"] = ModalScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%'
    }
});
