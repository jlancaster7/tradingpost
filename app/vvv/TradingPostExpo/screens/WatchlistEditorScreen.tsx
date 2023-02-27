import { useNavigation } from "@react-navigation/native";
import { Api } from "@tradingpost/common/api";
import { sleep } from "@tradingpost/common/utils/sleep";
import { Button, Icon, } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { ButtonGroup } from "../components/ButtonGroup";
import { Header, Subheader } from "../components/Headers";
import { ScrollWithButtons } from "../components/ScrollWithButtons";
import { ElevatedSection, Section } from "../components/Section";
import { SwitchField } from "../components/SwitchField";
import { TextField } from "../components/TextField";
import { VirtualListWithButtons } from "../components/VirtualListWithButtons";
import { useWatchlistPicker, WatchlistPicker } from "../components/WatchlistPicker";
import { setValue } from "../lds";
import { DashScreenProps, TabScreenProps } from "../navigation";
import { flex, fonts, paddView, paddViewWhite, sizes } from "../style";
type WLTypes = "public" | "primary" | "private";

export const WatchlistEditorScreen = (props: TabScreenProps<{ watchlistId?: number }>) => {
    const pickerProps = useWatchlistPicker();
    const [name, setName] = useState("");
    const [note, setNote] = useState<string>();
    const [type, setWatchlistType] = useState<WLTypes>("public");
    const [notifications, setNotifcations] = useState<boolean>(true)

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
                        setNotifcations(watchlist.is_notification)
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


    return <View style={{flex: 1}}>
        <VirtualListWithButtons
            buttons={{
                right: {
                    text: "Save",
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

                                if (props.route?.params?.watchlistId && props.route.params.watchlistId > 0) {
                                    await Api.Watchlist.update(props.route.params.watchlistId, watchlistData)
                                    await Api.Watchlist.extensions.toggleNotification({
                                        id: props.route.params.watchlistId,
                                        is_notification: notifications
                                    })
                                }
                                else {
                                    const watchlist = await Api.Watchlist.insert(watchlistData);
                                    await Api.Watchlist.extensions.toggleNotification({
                                        id: watchlist.id,
                                        is_notification: notifications
                                    })
                                }

                                nav.goBack()
                            }
                        }
                        else {
                            toast.show("Please name your watchlist");
                        }
                    }
                }
            }}>
            <View style={{}}>
                <View style={{ padding: sizes.rem1,  }}  >
                    <Header style={type === 'primary' ?  {display: 'none'} : {}} text={props.route?.params?.watchlistId ? 'Update Watchlist' : 'Create New Watchlist'} />
                    <Header style={type === 'primary' ? {} : {display: 'none'}} text={type === "primary" ? "Quick Watchlist" : ""} />
                    <WatchlistPicker  {...pickerProps} securitiesLoaded={() => {
                        setMagic(m => !m)
                    }} />
                </View>
                {type !== "primary" &&
                    <ElevatedSection title="" style={{ flex: 1, marginHorizontal: sizes.rem1}}>
                        <View style={{ flexDirection: "column", margin: sizes.rem0_5 }}>
                            <TextField value={name} onChangeText={(v) => setName(v || "")} placeholder="Name (Required)" style={{ marginBottom: sizes.rem0_5, fontSize: fonts.medium }} />
                            <TextField value={note} onChangeText={(v) => setNote(v || "")} placeholder="Notes or Description (Optional)" style={{ fontSize: fonts.small}} />
                            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: sizes.rem1}}>
                                <View style={{justifyContent:'center', alignItems: 'center'}}>

                                    <Subheader style={{color: '#ccc'}} text="Public" />
                                    <View style={{flexDirection: 'row'}}>
                                        <Pressable onPress={() => {
                                            setWatchlistType('public')
                                        }}
                                        style={[ { borderWidth: 1,padding:5, borderRadius: 20, marginHorizontal: 5 }, type === 'public' ? { borderStyle: 'solid',  borderColor: 'rgba(53, 162, 101, 1)', backgroundColor: '#F0F0F0'  } : {borderColor: 'transparent'}]}>
                                            <Icon 
                                                fill={"green"}
                                                height={28}
                                                width={28}
                                                name="unlock-outline" 
                                                style={{
                                                    height: 36,
                                                    width: 36
                                                }}/>
                                        </Pressable>
                                        <Pressable onPress={() => {
                                            setWatchlistType('private')
                                        }}
                                            style={[ { borderWidth: 1,padding:5, borderRadius: 20, marginHorizontal: 5 }, type === 'private' ? { borderStyle: 'solid',  borderColor: 'rgba(53, 162, 101, 1)', backgroundColor: '#F0F0F0'  } : {borderColor: 'transparent'}]}>
                                            <Icon 
                                                fill={"red"}
                                                height={28}
                                                width={28}
                                                name="lock-outline" style={{
                                                    height: 28,
                                                    width: 28
                                                }}/>
                                        </Pressable>
                                    </View>
                                </View>
                                <View style={{justifyContent:'center', alignItems: 'center'}}>
                                    <Subheader style={{color: '#ccc'}} text="Alerts" />
                                    <View style={{flexDirection: 'row'}}>
                                        <Pressable onPress={() => {
                                            
                                            setNotifcations(true)
                                        }}
                                            style={[ { borderWidth: 1,padding:5, borderRadius: 20, marginHorizontal: 5 }, notifications ? { borderStyle: 'solid',  borderColor: 'rgba(53, 162, 101, 1)', backgroundColor: '#F0F0F0'  } : {borderColor: 'transparent'}]}>
                                            <Icon 
                                                fill={"red"}
                                                height={28}
                                                width={28}
                                                name="bell-outline" style={{
                                                    height: 28,
                                                    width: 28
                                                }}/> 
                                        </Pressable>
                                        <Pressable onPress={() => {
                                            setNotifcations(false)
                                            }}
                                            style={[ { borderWidth: 1,padding:5, borderRadius: 20, marginHorizontal: 5 }, !notifications  ? { borderStyle: 'solid',  borderColor: 'rgba(53, 162, 101, 1)', backgroundColor: '#F0F0F0'  } : {borderColor: 'transparent'}]}>
                                            <Icon 
                                                fill={"grey"}
                                                height={28}
                                                width={28}
                                                name="bell-off-outline" style={{
                                                    height: 28,
                                                    width: 28
                                                }}/>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ElevatedSection>
                }
                
            </View>
        </VirtualListWithButtons>
    </View >

}
