import { useLinkTo } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { ScrollWithButtons } from "../../components/ScrollWithButtons";
import { YourContentComponent } from "../../components/YourContentComponent";
import { AppColors } from "../../constants/Colors";
import { flex } from "../../style";
import { sideMargin } from "./shared";

//import { claimPlatform, createPlatform, Platform } from "../../apis/UserApi"
//import { AmiraError } from "../../AmiraError"

export function YourContent(props?: any) {
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
            }}>
            <View style={[flex, { margin: sideMargin, marginTop: 12 }]} >
                <YourContentComponent isNewAccount={true} />
            </View>
    </ScrollWithButtons>
    )
}

