
import React, { Children, FC, PropsWithChildren, ReactElement } from "react";
//import { Text, View } from "react-native-ui-lib";
//import { LoginButtons } from "../components/LoginButtons";
import { AppTitle, SplashWelcome } from "../images";
//import { Screen } from "./BaseScreen";
//import CreateAccountScreen from "./CreateAccountScreen";
import { fonts, paddView, sizes } from '../style'
import { G, GProps, Path, SvgProps } from "react-native-svg";
import { cloneElement } from "react";
import { Link } from "../components/Link";
import { Text, View } from "react-native";
import { SvgExpo } from "../components/SvgExpo";
import { LoginButtons } from "../components/LoginButtons";
//import { BaseScreenProps } from "../layouts/BaseLayout";
//import LoginScreen from "./LoginScreen";
//import { LoginButtons } from "../components/LoginButtons";


export type WelcomeScreenProps = { title: string }

const ensureG = (child: ReactElement): child is ReactElement<GProps> => {
    return child.type === G;
}

//Test function will move out into helper later 
const SvgMagic: React.FC<{ children: ReactElement<SvgProps> }> = (props) => {
    const reportChildren = (children: ReactElement) => {
        Children.forEach(children, (child) => {
            if (ensureG(child))
                console.log("FOUND G WITH ID:::::::" + child.props.id);
            else {
                console.log("FOUND SOMETHING:::::::" + (child.type as any).name);
                console.log("FOUND SOMETHINGS CHIULDREN:::::::" + (JSON.stringify(child.props)));
            }
            reportChildren(child.props.children);
        })
    };

    reportChildren(props.children);

    return props.children;
}

// class WelcomeScreen extends Screen<WelcomeScreenProps> {
//     layoutProps: BaseScreenProps = {
//         scrollContentFlex: true
//     }
//     Content = (p: WelcomeScreenProps & { componentId: string }) => {
//         return <><View style={[...paddView, { height: "100%", backgroundColor: "white" }]}>
//             <AppTitle style={{ marginVertical: sizes.rem2, alignSelf: "center" }} />
//             <SplashWelcome style={{ backgroundColor: "orange", width: "100%", aspectRatio: 1.5 }} />
//             <Text style={{ textAlign: "center", margin: sizes.rem2, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>Welcome to the team!</Text>
//             <LoginButtons
//                 createAccountProps={{
//                     onPress: () => {
//                     //    CreateAccountScreen.open(p.componentId, {});
//                     }
//                 }}
//                 loginProps={{
//                 //    onPress: () => LoginScreen.open(p.componentId, {})
//                 }}
//             />

//         </View>
//             <Link style={{ textAlign: "right", position: "absolute", bottom: sizes.rem1, right: sizes.rem1, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>What is TradingPost{">>"}</Link>
//         </>
//     };
// }
//console.log("MY app type is " + typeof AppTitle)
export default () => {
    return <><View style={[...paddView, { justifyContent: "center" }]}>
        <AppTitle style={{ marginVertical: sizes.rem1, alignSelf: "center", width: "100%", aspectRatio: 5 }} />
        <SplashWelcome style={{ backgroundColor: "orange", width: "100%", aspectRatio: 1.5 }} />
        <Text style={{ textAlign: "center", margin: sizes.rem2, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>Welcome to the team!</Text>
        <LoginButtons
            createAccountProps={{
                onPress: () => {
                    //    CreateAccountScreen.open(p.componentId, {});
                }
            }}
            loginProps={{
                //    onPress: () => LoginScreen.open(p.componentId, {})
            }}
        />
    </View>
        <Link style={{ textAlign: "right", position: "absolute", bottom: sizes.rem1, right: sizes.rem1, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>What is TradingPost{">>"}</Link>
    </>
    //    
    //</View >
    // return <>
    //     <AppTitle style={{ marginVertical: sizes.rem2, alignSelf: "center" }} />
    //     <SplashWelcome style={{ backgroundColor: "orange", width: "100%", aspectRatio: 1.5 }} />
    //     <Text style={{ textAlign: "center", margin: sizes.rem2, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>Welcome to the team!</Text>
    //     {/* <LoginButtons
    //         createAccountProps={{
    //             onPress: () => {
    //                 //    CreateAccountScreen.open(p.componentId, {});
    //             }
    //         }}
    //         loginProps={{
    //             //    onPress: () => LoginScreen.open(p.componentId, {})
    //         }}
    //     /> */}

    // </View>
    //     <Link style={{ textAlign: "right", position: "absolute", bottom: sizes.rem1, right: sizes.rem1, fontSize: fonts.large, lineHeight: fonts.large * 1.5 }}>What is TradingPost{">>"}</Link>
    // </>
}