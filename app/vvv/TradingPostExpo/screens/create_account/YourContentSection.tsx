import React from "react";
import { View } from "react-native";
import { YourContentComponent } from "../../components/YourContentComponent";
import { AppColors } from "../../constants/Colors";

//import { claimPlatform, createPlatform, Platform } from "../../apis/UserApi"
//import { AmiraError } from "../../AmiraError"

export function YourContent() {
    return (
    <View style={{ backgroundColor: AppColors.background, borderColor: AppColors.background }}>
        <YourContentComponent />
    </View>
    )
}

