import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { Avatar, Text } from '@ui-kitten/components'
import { PieHolder } from "../components/PieHolder";
import { DashScreenProps, TabScreenProps } from "../navigation";
import { flex, paddView, row, sizes } from "../style";
import { ElevatedSection, Section } from "../components/Section";
import { Label } from "../components/Label";
import { FavButton } from "../components/AddButton";

export const CompanyScreen = (props: TabScreenProps<{ securityId: number }>) => {
    const [security, setSecurity] = useState<Interface.ISecurityGet>();
    const { securityId } = props.route.params
    const toast = useToast();
    const [isFav, setIsFav] = useState(false)
    useEffect(() => {

        Api.Security.get(securityId)
            .then((s) => {
                setSecurity(s)
                setIsFav(s.isOnQuickWatch || false)
            })
            .catch((ex) => toast.show(ex.message))

    }, [securityId])
    return <View style={paddView}>
        <ElevatedSection title="Company"
            button={(p) => {
                return <FavButton {...p} isSelected={isFav} onPress={() => {
                    if (security) {
                        Api.Security.extensions.quickadd({
                            add: !isFav,
                            ticker: security?.symbol
                        })
                        setIsFav(!isFav);
                    }
                }} />
            }}
        >
            <View style={[row, { marginBottom: sizes.rem0_5 }]}>
                <Avatar source={{ uri: security?.logo_url }} style={{ marginRight: sizes.rem0_5 }} />
                <View style={flex}>
                    <Text>{security?.symbol}</Text>
                    <Text>{security?.company_name}</Text>
                </View>
                <View>
                    <Text>{security?.price?.price}</Text>
                    <Text></Text>
                </View>
            </View>
            <View style={[row, { marginVertical: sizes.rem0_5 }]}>
                <Text style={flex} category={"label"}>Open</Text>
                <Text style={flex} category={"c1"}>{security?.price?.open}</Text>
                <Text style={flex} category={"label"}>52 Wk High</Text>
                <Text style={flex} category={"c1"}>{security?.price?.high}</Text>
            </View>
            <View style={[row, { marginBottom: sizes.rem1 }]}>
                <Text style={flex} category={"label"}>Close</Text>
                <Text style={flex} category={"c1"}>{"    "}</Text>
                <Text style={flex} category={"label"}>52 Wk Low</Text>
                <Text style={flex} category={"c1"}>{security?.price?.low}</Text>
            </View>
            <PieHolder />
            <Text style={{ marginTop: sizes.rem1 }}>{security?.description}</Text>
        </ElevatedSection >
        <ElevatedSection title="Posts">

        </ElevatedSection>
    </View >


}