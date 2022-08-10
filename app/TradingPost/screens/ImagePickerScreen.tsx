import React from "react"
import { Button, Colors, Text, View } from "react-native-ui-lib"
import { IconifyIcon } from "../components/IconfiyIcon"
import { BaseScreen, DashProps, screens } from "../layouts/BaseLayout"

import Camera from '@iconify/icons-carbon/camera'
import Library from '@iconify/icons-mdi/photo-library'
import Photo from '@iconify/icons-bytesize/photo'
import { flex, row, sizes } from "../style"
import { Label } from "../components/Label"
import { TextField } from "../components/TextField"
import { openCamera, openPicker } from "react-native-image-crop-picker"
import { FlatList } from "react-native-gesture-handler"
import { SearchBar } from "../components/SearchBar"
import { Navigation } from "react-native-navigation"


export type ImageResult = { data: string, mime: string } | null;
export type ImageResultCallback = (img: ImageResult, error: any) => void
export type CropSettings = {
    height: number,
    width: number,
    cropperCircleOverlay?: boolean
};
export type ImagePickerScreenProps = {
    allowSearch?: boolean,
    cropSettings?: CropSettings,
    onImagePicked?: ImageResultCallback
}

const pickImage = async (props: { componentId: string, onImagePicked?: ImageResultCallback, cropSettings?: CropSettings }, fromCamera?: boolean) => {
    let err: any = null,
        result: ImageResult = null;

    try {
        const pickFunc = fromCamera ? openCamera : openPicker,
            pickedImage = await pickFunc({
                includeBase64: true,
                mediaType: "photo",
                cropping: Boolean(props.cropSettings),
                ...props.cropSettings,
            })

        result = {
            data: pickedImage.data as string,
            mime: pickedImage.mime
        }
    }
    catch (ex) {
        err = ex;
        console.error(err);
    }

    if (props.onImagePicked)
        props.onImagePicked(result, err);

    Navigation.pop(props.componentId);
}

export const ImagePickerScreen = (props: ImagePickerScreenProps & DashProps) => {
    return <BaseScreen {...props}>
        <View style={[flex, { alignItems: "center" }]}  >
            <View style={{ width: "100%" }}>
                <SearchBar onTextChange={() => { }} />
            </View>
            <FlatList style={[{ backgroundColor: "darkgray", width: "100%" }]} data={[1, 2]}
                numColumns={3}
                renderItem={(i) => {
                    if (i.index === 0) {
                        return <View key="AAA" style={{ flex: 1 / 3, aspectRatio: 1.333, justifyContent: "center", borderColor: "#ccc", borderWidth: 1, alignItems: "center", backgroundColor: "#f5f5f5" }}>
                            <IconifyIcon key="camera" icon={Camera} currentColor="#545454" style={{ flex: 1, width: "100%", alignItems: "center" }}
                                svgProps={{ width: "60%" }}
                                pressableProps={{
                                    onPress: () => pickImage(props, true)
                                }}
                            />
                            < Label > From Camera</Label>
                        </View>
                    }
                    else if (i.index === 1) {
                        return <View key="BBB" style={{ flex: 1 / 3, aspectRatio: 1.333, justifyContent: "center", borderColor: "#ccc", borderWidth: 1, alignItems: "center", backgroundColor: "#f5f5f5" }}>
                            <IconifyIcon key="lib" icon={Photo} currentColor={"#545454"}
                                style={{ flex: 1, width: "100%", borderRadius: 8, alignItems: "center" }}
                                svgProps={{ width: "30%" }}
                                pressableProps={{
                                    onPress: () => pickImage(props)
                                }}
                            />
                            <Label>From Libaray</Label>
                        </View>
                    }
                    else {
                        return <View></View>
                    }
                }} />
            <View style={[row, { alignContent: "center", justifyContent: "space-evenly" }]} >


            </View>
        </View>
    </BaseScreen>
}


export function openImagePicker(componentId: string, settings: ImagePickerScreenProps) {
    screens.push(componentId, "ImagePicker", {
        passProps: { ...settings, isFullscreen: true }
    })
}