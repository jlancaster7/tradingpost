import { useNavigation } from "@react-navigation/native";
import { Api } from "@tradingpost/common/api";
import { sleep } from "@tradingpost/common/utils/sleep";
import { Button, } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { ButtonGroup } from "../components/ButtonGroup";
import { ScrollWithButtons } from "../components/ScrollWithButtons";
import { ElevatedSection, Section } from "../components/Section";
import { SwitchField } from "../components/SwitchField";
import { TextField } from "../components/TextField";
import { VirtualListWithButtons } from "../components/VirtualListWithButtons";
import { useWatchlistPicker, WatchlistPicker } from "../components/WatchlistPicker";
import { setValue } from "../lds";
import { DashScreenProps, TabScreenProps } from "../navigation";
import { flex, paddView, paddViewWhite, sizes } from "../style";
type WLTypes = "public" | "primary" | "private";

export const WatchlistEditorScreen = (props: TabScreenProps<{ watchlistId?: number }>) => {
    const pickerProps = useWatchlistPicker();
    const [name, setName] = useState("");
    const [note, setNote] = useState<string>();
    const [type, setWatchlistType] = useState<WLTypes>("public");

    const watchlistId = props.route?.params?.watchlistId;
    //TODO: HACK need to clean this u
    const nav = useNavigation()
    const [magic, setMagic] = useState(true);
    const toast = useToast();
    useEffect(() => {
        (async ()=> {
            const converter = pickerProps.symbolConverter.current;
            if (watchlistId && converter){
                if (watchlistId > 0) {
                    Api.Watchlist.get(watchlistId).then((watchlist) => {
                        //TODO: need to deal with settings for primary watchlist
                        setName(watchlist.name);
                        setWatchlistType(watchlist.type as WLTypes);
                        setNote(watchlist.note);
                        const selectedItems = converter(watchlist.items.map((s) => s.symbol));
                        pickerProps.onSelectedItemschanged(selectedItems);
    
                        //TODO:: need to cache items notes since this is an delete and insert style update
    
                    }).catch((ex) => {
                        toast.show(ex.message);
                    })
                }
                else {
                    setName("Primary Watchlists")
                    setWatchlistType("primary");
                }
            }
        })()
        
    }, [watchlistId, Boolean(pickerProps.symbolConverter.current)])


    return <View style={paddView}>
        <VirtualListWithButtons
            buttons={{
                right: {
                    text: props.route?.params?.watchlistId ? "Update Watchlist" : "Create Watchlist",
                    onPress: async () => {
                        if (name && pickerProps.selectionConverter.current) {
                            const items = pickerProps.selectionConverter.current(pickerProps.selectedItems);
                            if (items.length < 2)
                                toast.show("Please select at least 2 securities");
                            else {
                                const watchlistData = {
                                    items: items.map(i => ({
                                        symbol: i.symbol,
                                        date_added: new Date()
                                    })),
                                    name: name,
                                    note,
                                    type: type
                                }

                                if (props.route?.params?.watchlistId && props.route.params.watchlistId > 0) await Api.Watchlist.update(props.route.params.watchlistId, watchlistData)
                                else await Api.Watchlist.insert(watchlistData)

                                nav.goBack()
                            }
                        }
                        else {
                            toast.show("Please name your watchlist");
                        }
                    }
                }
            }}>
            <View>
                {type !== "primary" &&
                    <ElevatedSection title={(props.route?.params?.watchlistId ? "Edit" : "Create") + " Watchlist"} >
                        <View style={{ flexDirection: "column", margin: sizes.rem0_5 }}>
                            <ButtonGroup value={type} onValueChange={(value) => {
                                setWatchlistType(value);
                            }}
                                items={[{ label: "Public", value: "public" }, { label: "Private", value: "private" }]}
                            />
                            <TextField value={name} onChangeText={(v) => setName(v || "")} placeholder="Watchlist Name" style={{ marginBottom: sizes.rem0_5 }} />
                            <TextField value={note} onChangeText={(v) => setNote(v || "")} placeholder="Watchlist Note" style={{}} />
                        </View>
                    </ElevatedSection>
                }
                <ElevatedSection style={{ height: "100%" }} title={type === "primary" ? "Quick Watchlist" : "Watchlist Securities"}>
                    <WatchlistPicker {...pickerProps} securitiesLoaded={() => {
                        console.log("Securities are available...");
                        setMagic(m => !m)
                    }} />
                </ElevatedSection>
            </View>
        </VirtualListWithButtons>
    </View >

}
