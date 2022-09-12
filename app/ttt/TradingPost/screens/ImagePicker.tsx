

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Image, Text, Button, Animated, ImageBackground, useWindowDimensions, View, Alert, Platform } from "react-native";
import { TabScreenProps } from "../navigation";
import { ImageEditor } from 'expo-image-editor'
import { flex } from "../style";
import * as ImagePicker from 'expo-image-picker'
import { PrimaryButton } from "../components/PrimaryButton";
import { Api } from "@tradingpost/common/api";
//import { ImageManipulator } from 'expo-image-crop'
//const imageCrop = require('expo-image-crop')
//const ImageManipulator = imageCrop.ImageManipulator;


export const ImagePickerScreen = (props: TabScreenProps<{ onComplete: (data: any) => void }>) => {

    const [imageUri, setImageUri] = useState<string>(),
        [editorVisible, setEditorVisible] = useState(false),
        [imageData, setImageData] = useState<{ uri: string }>();
    // const pickImage = async () => {
    //     // No permissions request is necessary for launching the image library
    //     let result = await launchImageLibraryAsync({
    //         mediaTypes: MediaTypeOptions.All,
    //         allowsEditing: true,
    //         aspect: [4, 3],
    //         quality: 1,
    //     });

    //     console.log(result);

    //     if (!result.cancelled) {
    //         setImageUri(result.uri);
    //     }
    // };

    const selectPhoto = async () => {
        // Get the permission to access the camera roll
        const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // If they said yes then launch the image picker
        if (response.granted) {
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                base64:true
            });
            // Check they didn't cancel the picking
            console.log("PHOTO HAS BEEN SELECTED");
            if (!pickerResult.cancelled) {
                launchEditor(pickerResult.uri);
            }
        } else {
            // If not then alert the user they need to enable it
            Alert.alert(
                "Please enable camera roll permissions for this app in your settings."
            );
        }
    };

    const launchEditor = (uri: string) => {
        // Then set the image uri
        setImageUri(uri);
        // And set the image editor to be visible
        console.log("SHOWING EDITOR");
        setEditorVisible(true);
    };

    return <View style={flex}>
        <Image
            style={{ height: 300, width: 300 }}
            source={{ uri: imageData?.uri }}
        />
        <Button title="Select Photo" onPress={() => selectPhoto()} />

        {imageData?.uri &&
            <PrimaryButton onPress={async () => {
                try {
                    await Api.User.extensions.uploadProfilePic({
                        image: imageData.uri
                    })
                    props.navigation.goBack()
                }
                catch (ex) {
                    console.error(ex);
                }

            }} >Upload Photo</PrimaryButton>}
        <ImageEditor

            //asView={Platform.OS === "web"}
            visible={editorVisible}
            onCloseEditor={() => {
                console.log("CLOSING....................................................");
                setEditorVisible(false)
            }}
            imageUri={imageUri}
            fixedCropAspectRatio={1}
            lockAspectRatio={true}
            minimumCropDimensions={{
                width: 100,
                height: 100,
            }}
            onEditingComplete={(result) => {
                setImageData(result);
            }}
            mode="crop-only"
        />
    </View>

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

