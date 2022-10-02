import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { Avatar, Text } from '@ui-kitten/components'
import { flex, paddView, row, sizes } from "../style";
import { ElevatedSection } from "../components/Section";
import { Tab, TabBar } from "@ui-kitten/components";
import { FavButton } from "../components/AddButton";
import { toDollarsAndCents } from "../utils/misc";
import InteractiveChart from "../components/InteractiveGraph";
import { ButtonGroup } from "../components/ButtonGroup";
import { FeedPart } from "./FeedScreen";
import { RootStackScreenProps } from "../navigation/pages";

const periods: { [key: string]: number } = {
    "1D": 1,
    "1W": 5,
    "1M": 20,
    "3M": 60,
    "1Y": 252,
    "2Y": 252 * 2,
    "5Y": 252 * 5,
    "Max": 252 * 10
}
const tabBarMargin = sizes.rem1;

export const CompanyScreen = (props: RootStackScreenProps<"Company">) => {

    const [security, setSecurity] = useState<Interface.ISecurityGet>();
    const [securityPrices, setSecurityPrices] = useState<{ x: string, y: number }[]>();
    const { securityId } = props.route.params
    const toast = useToast();
    const [isFav, setIsFav] = useState(false);
    const [description, setDescription] = useState<string>();
    const [portPeriod, setPortPeriod] = useState("1Y")
    const [tab, setTab] = useState(0);

    useEffect(() => {
        Api.Security.get(securityId)
            .then((s) => {
                setSecurity(s)
                console.log(s);
                s.description ? setDescription(s.description.substring(0, 300) + '...') :
                    setIsFav(s.isOnQuickWatch || false)
            })
            .catch((ex) => toast.show(ex.message))
        Api.Security.extensions.getPrices({ securityId: securityId, includeIntraday: false, includeHistorical: true })
            .then((p) => {
                const prices = p.historical.slice(p.historical.length - periods[portPeriod]).map((a: any) => {
                    return { x: a.date, y: a.close }
                })
                setSecurityPrices(prices);

            })
            .catch((ex) => toast.show(ex.message))

    }, [securityId, portPeriod])


    return <View style={[{ height: "100%" }]}>
        <ScrollView>
            <View style={[paddView, { height: "100%" }]}>
                <ElevatedSection key={"Company"} title="Company"
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
                            <Text>{toDollarsAndCents(security?.price?.price)}</Text>
                            <Text></Text>
                        </View>
                    </View>
                    <View style={[row, { marginVertical: sizes.rem0_5 }]}>
                        <Text style={flex} category={"label"}>Open</Text>
                        <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.price?.open)}</Text>
                        <Text style={flex} category={"label"}>52 Wk High</Text>
                        <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.week_52_high)}</Text>
                    </View>
                    <View style={[row, { marginBottom: sizes.rem1 }]}>
                        <Text style={flex} category={"label"}>Close</Text>
                        <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.price?.price)}</Text>
                        <Text style={flex} category={"label"}>52 Wk Low</Text>
                        <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.week_52_low)}</Text>
                    </View>
                    <View style={{ marginBottom: sizes.rem1 }} >
                        <InteractiveChart data={securityPrices} performance={false} />
                    </View>

                    <ButtonGroup key={"period"} items={["1D", "1W", "1M", "3M", "1Y", "5Y", "Max"].map(v => ({ label: v, value: v }))} onValueChange={(v) => setPortPeriod(v)} value={portPeriod} />

                    <Text style={{ marginTop: sizes.rem1 }}>{description}</Text>
                </ElevatedSection >
            </View>

            <View >
                <ElevatedSection title="" style={{ marginHorizontal: sizes.rem1 }} >
                    <TabBar
                        key={"company_tabBar"}
                        indicatorStyle={{
                            marginTop: 26,
                            marginHorizontal: 10
                        }}
                        style={{ width: "100%", marginHorizontal: 0 }}
                        selectedIndex={tab}
                        onSelect={t => {
                            setTab(t);
                        }}>
                        {["Posts", "Analysts"].map(t => <Tab key={"tab_id" + t} style={{ marginTop: -4 }} title={t} />)}
                    </TabBar>
                </ ElevatedSection>
                <FeedPart searchText={`$${security?.symbol}`} />

            </View>

        </ScrollView>
    </View >


}