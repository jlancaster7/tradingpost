import {NavigationProp, useFocusEffect, useNavigation} from "@react-navigation/native"
import {Api} from "@tradingpost/common/api"
import WatchlistApi from "@tradingpost/common/api/entities/apis/WatchlistApi"
import {IWatchlistGetExt} from "@tradingpost/common/api/entities/extensions/Watchlist"
import {Avatar, Icon} from "@ui-kitten/components"
import React, {PropsWithChildren, useCallback, useRef, useState} from "react"
import {Header} from "../components/Headers";
import {Animated, FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, Text, View} from "react-native"
import {useToast} from "react-native-toast-notifications"
import {useAppUser} from "../Authentication"
import {EditButton, FavButton} from "../components/AddButton"
import {ProfileBar} from "../components/ProfileBar"
import {ElevatedSection, Section} from "../components/Section"
import {ITableColumn} from "../components/Table"
import {TextField} from "../components/TextField"
import {AppColors} from "../constants/Colors"
import {flex, row, sizes} from "../style"
import {useSecuritiesList} from '../SecurityList'
import {toDollarsAndCents, toPercent2} from "../utils/misc"
import {List} from "../components/List"
import {WatchlistItemRenderItem} from "../components/WatchlistItemRenderItem"
import {PrimaryChip} from "../components/PrimaryChip"
import {FeedPart} from './FeedScreen'
import {SwitchField} from "../components/SwitchField"
import NotificationSubscriptionApi from "@tradingpost/common/api/entities/apis/NotificationSubscriptionApi";
import {NotificationSubscriptionTypes} from "@tradingpost/common/notifications/interfaces";


export const useNoteField = (hideEmptyNote?: boolean) => {
    const [shownMap, setShownMap] = useState<Record<string, boolean>>({})
    return {
        shownMap,
        column: {
            field: (info: { index: number, item: { note?: string } }) => {
                return <Pressable onPress={() => {
                    if (info.item.note || !hideEmptyNote) {
                        setShownMap({
                            ...shownMap,
                            [info.index]: !shownMap[info.index]
                        })
                    }
                }}>
                    <Icon style={{
                        opacity: (info.item.note || !hideEmptyNote) ? (info.item.note ? 1 : 0.25) : 0,
                        height: 16,
                        width: 22
                    }} name={!shownMap[info.index] ? "file-text-outline" : "close-outline"}
                          fill={AppColors.primary}
                    /></Pressable>
            }, alias: " ", width: 32
        }
    }
}


export const SecPressable = (props: PropsWithChildren<{ securityId: number }>) => {
    const nav = useNavigation<NavigationProp<AllPages>>();
    return <Pressable onPress={() => {
        if (props.securityId !== -1) {
            nav.navigate("Company", {
                securityId: props.securityId
            })
        }
    }}>{props.children}</Pressable>
}

export const useMakeSecurityFields = (getIdValue: (itm: any) => string | number) => {
    const {securities: {bySymbol, byId}} = useSecuritiesList();
    return [{
        field: (a: any) => {
            const value = getIdValue(a.item);
            return (
                <View style={{overflow: 'visible'}}>
                    <SecPressable securityId={
                        (() => {
                            if (typeof value === "string")
                                return bySymbol[value]?.id || -1
                            else
                                return byId[value]?.id || -1
                        })()
                    }>
                        <Avatar style={{marginRight: sizes.rem0_5}}
                                resizeMode={'contain'}
                                source={
                                    (() => {
                                        let output: { uri: string } | undefined;
                                        if (typeof value === "string")
                                            output = bySymbol[value] ? {uri: bySymbol[value].logo_url} : undefined
                                        else
                                            output = byId[value] ? {uri: byId[value].logo_url} : undefined
                                        return output;
                                    })()}
                                size="tiny"
                        />

                    </SecPressable>
                </View>
            )
        },
        headerStyle: {
            width: sizes.rem10 / 2,
            //marginRight: sizes.rem0_5,
            overflow: "visible" as "visible"
        },
        alias: "Ticker",
        align: "left" as "left",
        width: sizes.rem2
    },
        {
            alias: "",
            width: sizes.rem6 / 2,
            align: "left" as "left",
            style: {lineHeight: sizes.rem1_5},
            headerStyle: {
                width: 0,
            },
            stringify: (value: any, key: any, item: any) => {
                const v = getIdValue(item);
                if (typeof v === "string")
                    return bySymbol[v]?.symbol === 'USD:CUR' ? 'Cash' : bySymbol[v]?.symbol || ""
                else
                    return byId[v]?.symbol === 'USD:CUR' ? 'Cash' : byId[v]?.symbol || ""
            }
        }
    ]
}

export const useWatchlistItemColumns = (hideEmptyNote?: boolean) => {

    const [iconField, secField] = useMakeSecurityFields((item) => item.symbol);
    const {column, shownMap} = useNoteField(hideEmptyNote);
    return {
        shownMap,
        columns: [
            iconField,
            secField,
            {
                alias: "Price",
                field: (a) => {
                    const change = a.item.price?.price || a.item.price?.open ? (a.item.price?.price - a.item.price?.open) / a.item.price?.open : 0
                    return (
                        <View style={{justifyContent: 'center', flexDirection: 'row', flex: 1}}>
                            <Text
                                style={[change ? change >= 0 ? {color: 'green'} : {color: 'red'} : {}, {marginRight: sizes.rem0_5}]}>{`(${toPercent2(change)})`}</Text>
                            <Text>{toDollarsAndCents(a.item.price?.price)}</Text>
                        </View>
                    )
                },
                //align: 'left' as 'left',
                //width: sizes.rem6
                /*
                stringify: (a, b, c) => {
                    if (c.price?.price) {
                        return toDollarsAndCents(c.price.price);
                    }
                    else
                        return "-"
                }
                */
            }/*,
            {
                alias: "Date Added",
                stringify: (a, b, c) => {
                    if (c.price?.time) {
                        return (new Date(c.date_added)).toLocaleDateString() || "-"
                    }
                    else {
                        return "-";
                    }
                }
            }*/,
            column
            //        { field: "symbol", align: "left", style: { lineHeight: sizes.rem1_5 } },
        ] as ITableColumn<IWatchlistGetExt["items"][number]>[]
    }
}


export const WatchlistViewerScreen = (props: TabScreenProps<{ watchlistId: number }>) => {
    const [watchlist, setWatchlist] = useState<IWatchlistGetExt>(),
        [isSaved, setIsFav] = useState(false),
        [watchlistTickers, setWatchlistTickers] = useState<string[]>(),
        [notificationToggle, setNotificationToggle] = useState<boolean>(false);
    const {loginState} = useAppUser();
    const watchlistId = props.route?.params?.watchlistId;
    const appUser = loginState?.appUser;
    const translateHeaderY = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<FlatList>(null);

    const toast = useToast();
    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                if (watchlistId) {
                    const watchlist = await WatchlistApi.get(watchlistId);
                    setNotificationToggle(watchlist.is_notification);
                    setIsFav(watchlist.is_saved)
                    setWatchlist(watchlist as IWatchlistGetExt);
                }
                if (watchlist) {
                    setWatchlistTickers(watchlist.items.map(a => `$${a.symbol}`))
                }
            } catch (err) {
                console.error(err);
            }
        })()
    }, []))

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                if (watchlist) {
                    setWatchlistTickers(watchlist.items.map(a => `$${a.symbol}`))
                }
            } catch (err) {
                console.error(err);
            }
        })()
    }, [watchlist]))

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                if (watchlistId) {
                    //const [toggle, w] = await Promise.all([NotificationSubscriptionApi.extensions.getStatus(watchlistId), WatchlistApi.get(watchlistId)])
                    const watchlist = await WatchlistApi.get(watchlistId);
                    setNotificationToggle(watchlist.is_notification);
                    setIsFav(watchlist.is_saved)
                    setWatchlist(watchlist as IWatchlistGetExt);
                }
                if (watchlist) {
                    setWatchlistTickers(watchlist.items.map(a => `$${a.symbol}`))
                }
            } catch (err) {
                console.error(err);
            }
        })()
    }, [watchlistId]))

    const {securities: {bySymbol, byId}} = useSecuritiesList();
    const [shownMap, setShownMap] = useState<Record<string, boolean>>({})

    return <View style={[flex]}>
        <Animated.FlatList
            data={[
                <View style={{
                    paddingTop: sizes.rem0_5,
                    paddingHorizontal: sizes.rem1,
                    backgroundColor: AppColors.background,
                }}>
                    <Header text={watchlist?.name || ""}/>
                    <ElevatedSection title={""}>
                        <View style={[row, flex]}>
                            <ProfileBar style={flex} user={watchlist?.user[0]}/>
                            <View style={{width: '30%', alignItems: 'center', justifyContent: 'center'}}>
                                <PrimaryChip style={{width: '80%'}} isAlt key={watchlist?.id}
                                             label={watchlist?.type ? watchlist.type.slice(0, 1).toUpperCase() + watchlist.type.slice(1) : ''}/>
                            </View>
                            <View style={{width: '10%', alignItems: 'center', justifyContent: 'center'}}>
                                {watchlist?.user[0].id === appUser?.id ?
                                    <EditButton
                                        height={24}
                                        width={24}
                                        onPress={() => {
                                            props.navigation.navigate("WatchlistEditor", {
                                                watchlistId: watchlistId
                                            })
                                        }}/> :
                                    <FavButton
                                        height={24}
                                        width={24}
                                        isSelected={isSaved}
                                        onPress={async () => {
                                            try {
                                                if (watchlistId) {
                                                    const result = await Api.Watchlist.extensions.saveWatchlist({
                                                        id: watchlistId,
                                                        is_saved: !isSaved
                                                    });

                                                    result ? toast.show("Followed Watchlist") : toast.show("Unfollowed Watchlist")
                                                    if (isSaved) setNotificationToggle(false);
                                                    setIsFav(!isSaved);
                                                    

                                                }
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                    />}
                            </View>
                        </View>
                        <Text style={[{marginVertical: sizes.rem0_5}, !watchlist?.note ? {
                            color: "#ccc",
                            fontStyle: "italic"
                        } : undefined]}>
                            {watchlist?.note || "No Notes"}
                        </Text>
                    </ElevatedSection>
                </View>,
                <SwitchField
                    label='Enable Notifications'
                    checked={notificationToggle}
                    onChange={async () => {
                        if (!watchlistId ) return;
                        const result = Api.Watchlist.extensions.toggleNotification({
                            id: watchlistId,
                            is_notification: notificationToggle
                        })
                        setNotificationToggle(!notificationToggle);
                    }}
                    viewStyle={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        paddingHorizontal: sizes.rem1_5,
                        paddingBottom: sizes.rem0_5,
                        backgroundColor: AppColors.background
                    }}
                    toggleStyle={{}}
                    textStyle={{alignSelf: 'center'}}>
                </SwitchField>,
                <View style={[
                    //collapsed ? {display: 'none'} : {display: 'flex'},
                    {paddingHorizontal: sizes.rem1, backgroundColor: AppColors.background}]}>
                    <Section title="Companies"
                             style={{backgroundColor: AppColors.background}}>

                        <List
                            listKey={`watchlist_id}`}
                            datasetKey={`watchlist_id_${watchlist?.items.length}`}
                            data={watchlist?.items}
                            loadingMessage={" "}
                            noDataMessage={" "}
                            loadingItem={undefined}
                            numColumns={2}
                            renderItem={(item) => {
                                const symbol = item.item.symbol;
                                const hideEmptyNote = watchlist?.user[0].id !== appUser?.id
                                return (
                                    <WatchlistItemRenderItem
                                        item={item}
                                        bySymbol={bySymbol}
                                        byId={byId}
                                        hideEmptyNote={hideEmptyNote}
                                        setShownMap={setShownMap}
                                        shownMap={shownMap}
                                        watchlist={watchlist}/>
                                )
                            }}
                        />
                    </Section>
                </View>
                ,
                <View style={[{paddingHorizontal: sizes.rem1, backgroundColor: AppColors.background}]}>
                    <Header text="Posts"/>
                </View>,
                <View style={[{paddingHorizontal: 0}]}>
                    {watchlistTickers && <FeedPart key={watchlistTickers ? watchlistTickers.join() : "___"}
                                                   searchTerms={watchlistTickers}/>}
                </View>
            ]}
            renderItem={(info) => {
                return info.item;
            }}
            ref={scrollRef} contentContainerStyle={[{paddingTop: 0}]} nestedScrollEnabled
            onScroll={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
                {nativeEvent: {contentOffset: {y: translateHeaderY}}}
            ], {useNativeDriver: true})}>
        </Animated.FlatList>
    </View>
}

export const NoteEditor = (props: { canEdit: boolean, note: string | undefined, ticker: string, watchlistId: number, onChangeNote: (note: string) => void }) => {
    const [isEdit, setIsEdit] = useState(!props.note && props.canEdit);
    const [note, setNote] = useState(props.note)

    return (!props.canEdit || (!isEdit && note)) ?
        <View style={{flexDirection: "row", alignItems: "center"}}><Text><Text
            style={{fontWeight: "bold"}}>Note:</Text>{note}</Text>
            {props.canEdit && <EditButton
                style={{marginLeft: "auto"}}
                height={24} width={24} onPress={() => {
                setIsEdit(true);
            }}
            />}

        </View> :
        <View style={[row, {alignItems: "center"}]}><TextField placeholder="Add a note" style={flex} value={note}
                                                               onChangeText={(t) => {
                                                                   setNote(t);
                                                               }}/><Pressable onPress={() => {
            props.onChangeNote(note || "");
            setIsEdit(false)
        }
        }><Icon name="checkmark-outline" fill={AppColors.primary} style={{
            height: 24,
            width: 24
        }}/>
        </Pressable>
        </View>

}
/*
class WrappedView extends Component<finishedLoadingProp> {
    finishedLoading: boolean;
    constructor(props: finishedLoadingProp) {
        super(props)
        this.finishedLoading = props.finishedLoading
    }
    shouldComponentUpdate(nextProps: Readonly<ViewProps>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (this.finishedLoading){
            return false;
        }
        else {
            return true
        }
    }
    render(): React.ReactNode {
        let {style, children} = this.props
        return (
            <View style={style}>
                {children}
            </View>
        )
    }
}
export interface finishedLoadingProp extends ViewProps {
    finishedLoading: boolean
}


class WrappedAnimatedView extends Component<finishedLoadingProp> {
    finishedLoading: boolean;
    constructor(props: finishedLoadingProp) {
        super(props)
        this.finishedLoading = props.finishedLoading
    }
    shouldComponentUpdate(nextProps: Readonly<ViewProps>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (this.finishedLoading){
            return false;
        }
        else {
            return true
        }
    }
    render(): React.ReactNode {
        let {style, children} = this.props
        return (
            <Animated.View style={style}>
                {children}
            </Animated.View>
        )
    }
}
*/