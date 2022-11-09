import { useLinkTo } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { ScrollWithButtons } from "../../components/ScrollWithButtons";
import { YourContentComponent } from "../../components/YourContentComponent";
import { AppColors } from "../../constants/Colors";

//import { claimPlatform, createPlatform, Platform } from "../../apis/UserApi"
//import { AmiraError } from "../../AmiraError"

export function YourContent() {
    const linkTo = useLinkTo<any>()
    return (
        <ScrollWithButtons
            fillHeight
            buttons={{
                right: {
                    text: "I'm Done Linking Accounts",
                    onPress: () => {
                        linkTo('/create/subscriptioncost')
                    }
                }
            }}
        >
        <YourContentComponent />
    </ScrollWithButtons>
    )
}

