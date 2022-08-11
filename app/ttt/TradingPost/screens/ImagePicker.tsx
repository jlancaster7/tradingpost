import { Button } from "@ui-kitten/components";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Animated, View } from "react-native";
import { TabScreenProps } from "../navigation";
import { requestMediaLibraryPermissionsAsync, ImageInfo, launchImageLibraryAsync } from 'expo-image-picker'

import { flex } from "../style";

//const imageCrop = require('expo-image-crop')
//const ImageManipulator = imageCrop.ImageManipulator;

export const ImagePickerScreen = (props: TabScreenProps<{ onComplete: (data: any) => void }>) => {
    const [imageUri, setImageUri] = useState("")
    // useLayoutEffect(() => {
    //     requestMediaLibraryPermissionsAsync().then(async (r) => {
    //         if (r.granted) {
    //             const img = await launchImageLibraryAsync();
    //             setImageUri((img as ImageInfo).uri);
    //         }
    //         else {
    //             props.navigation.goBack();
    //         }
    //     });
    // }, [])
    return <View style={[flex, { backgroundColor: "orange" }]}>
        <Animated.View
            onMoveShouldSetResponder={() => true}
            onStartShouldSetResponder={() => true}
            onResponderStart={() => {
                console.log("STARTED RESPONDER")
            }}
            onResponderMove={(ev) => {
                console.log(`MOVING  (${ev.nativeEvent.pageX},${ev.nativeEvent.pageY})`)
            }}

            style={{ height: 100, width: 100, backgroundColor: "blue" }}>

        </Animated.View>
        {/* <ImageManipulator
            photo={{ uri:imageUri }}
            isVisible
            onPictureChoosed={(p:any) => setImageUri(p.uri)}
            onToggleModal={()=>{}}
        /> */}
        {/* <ImageEditor
            imageUri={imageUri}
            visible={Boolean(imageUri)}
            onCloseEditor={() => () => {
                props.navigation.goBack()
            }}
            fixedCropAspectRatio={1}
            lockAspectRatio={true}
            minimumCropDimensions={{
                width: 100,
                height: 100,
            }}
            onEditingComplete={(result) => {
                //            setImageData(result);
            }}
            mode="full"
        /> */}
    </View>
}

