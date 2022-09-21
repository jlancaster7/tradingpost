"use strict";
exports.__esModule = true;
var react_native_1 = require("react-native");
var Themed_1 = require("../components/Themed");
function TabOneScreen(_a) {
    var navigation = _a.navigation;
    return (<Themed_1.View style={styles.container}>
      <Themed_1.Text style={styles.title}>To Be Implemented</Themed_1.Text>
      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <EditScreenInfo path="/screens/TabOneScreen.tsx" /> */}
    </Themed_1.View>);
}
exports["default"] = TabOneScreen;
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
