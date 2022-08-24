

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Text, Button, Animated, ImageBackground, useWindowDimensions, View } from "react-native";
import { TabScreenProps } from "../navigation";
import { requestMediaLibraryPermissionsAsync, ImageInfo, launchImageLibraryAsync } from 'expo-image-picker'

import { flex } from "../style";
//import { ImageManipulator } from 'expo-image-crop'
//const imageCrop = require('expo-image-crop')
//const ImageManipulator = imageCrop.ImageManipulator;


export const ImagePickerScreen = (props: TabScreenProps<{ onComplete: (data: any) => void }>) => {
    return <Text>/Sigh</Text>
    // const [imageUri, setImageUri] = useState("'https://i.pinimg.com/originals/39/42/a1/3942a180299d5b9587c2aa8e09d91ecf.jpg'")
    // // useLayoutEffect(() => {
    // //     requestMediaLibraryPermissionsAsync().then(async (r) => {
    // //         if (r.granted) {
    // //             const img = await launchImageLibraryAsync();
    // //             setImageUri((img as ImageInfo).uri);
    // //         }
    // //         else {
    // //             props.navigation.goBack();
    // //         }
    // //     });
    // // }, [])
    // const [isVisible, setIsVisisble] = useState(false);
    // const { width, height } = useWindowDimensions();
    // return <ImageBackground
    //     resizeMode="contain"
    //     style={[flex, {
    //         justifyContent: 'center', padding: 20, alignItems: 'center', height, width, backgroundColor: 'black',
    //     }]}
    //     source={{ uri: imageUri }}
    // >
    //     <Button title="Open Image Editor" onPress={() => setIsVisisble(true)} />
    //     <ImageManipulator
    //         photo={{ uri: imageUri }}
    //         isVisible={isVisible}
    //         onPictureChoosed={(p: { uri: string }) => setImageUri(p.uri)}
    //         onToggleModal={() => setIsVisisble(v => !v)}
    //     />
    // </ImageBackground>
}

