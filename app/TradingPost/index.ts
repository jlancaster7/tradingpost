/**
 * @format
 */

//import { AppRegistry } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Colors } from 'react-native-ui-lib';
import App from './App';
import { name as appName } from './app.json';
import { SetPublicLayout as SetBaseLayout } from './layouts/BaseLayout';

//AppRegistry.registerComponent(appName, () => App);
Colors.loadColors({
    primary: '#11146F',
    //primaryColor: '#2364AA',
    //secondaryColor: '#81C3D7',
    secondary: '#35A265',
    lightBlue: "#cae9fb"
    //textColor: '#221D23',
    //errorColor: '#E63B2E',
    //successColor: '#ADC76F',
    //warnColor: '#FF963C'
});


Navigation.events().registerAppLaunchedListener(async () => {
    try {
        //await initApp();
        //const creds = await getStoredCreds();
        //let user: IAuthenticatedUser | undefined = undefined;

        // try {
        //     user = creds ? await signInWithRefreshToken(creds) : undefined;
        // }
        // catch (ex) {
        //     console.error(ex);
        //     resetGenericPassword();
        // }


        //if (user && user.status_confirmed && user.status_setup) {
        //  SetDashboardLayout();
        //}
        //else {
        SetBaseLayout(
            //Boolean(user)

        )
        //}
    }
    catch (ex) {
        //SetPublicLayout();
        console.error(ex);
    }
});