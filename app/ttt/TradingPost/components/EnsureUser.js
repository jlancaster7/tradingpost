"use strict";
// import { NavigationProp, useLinkTo } from "@react-navigation/native";
// import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
// import React, { useCallback } from "react";
// import { MutableRefObject, PropsWithChildren, PropsWithRef, useRef } from "react";
// import { Linking, View } from "react-native";
// import { useAppUser } from "../App";
// import Auth from '@tradingpost/common/api/entities/static/AuthApi';
// import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";
// let isLoggingOut = false;
// export const resetEnsureUser = () => {
//     isLoggingOut = false
// }
// const navigateToLogin = (linkTo: (to: To<any>) => void) => {
//     if (!isLoggingOut) {
//         isLoggingOut = true;
//         setTimeout(() => {
//             linkTo("/login");
//         }, 333);
//     }
// }
// //Ensures that appuser used inside of the EnsureUser block is a valid user or logs the user out 
// export const useEnsureUser = (navigation: NavigationProp<any>) => {
//     const { appUser, signIn, signOut } = useAppUser();
//     const appUserRef = useRef(appUser);
//     const linkTo = useLinkTo<any>();
//     if (!appUser && !isLoggingOut) {
//         Auth.signOut();
//         navigateToLogin(linkTo);
//     }
//     appUserRef.current = appUser;
//     const EnsureUser = useCallback((props: PropsWithChildren<{}>) => {
//         console.log("Current User is .... " + appUserRef.current?.handle);
//         return <> {appUserRef.current && props.children}
//             {!appUserRef.current && <View></View>}
//         </>
//     }, []);
//     return {
//         EnsureUser,
//         //Because the components will get unloaded if there is not a current user, this should be safe.
//         appUser: appUser as IUserGet || {},
//         signIn,
//         signOut
//     }
// }
