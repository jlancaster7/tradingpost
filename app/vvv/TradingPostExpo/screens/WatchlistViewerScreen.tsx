import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Api, Interface } from "@tradingpost/common/api"
import WatchlistApi from "@tradingpost/common/api/entities/apis/WatchlistApi"
import { IWatchlistGetExt } from "@tradingpost/common/api/entities/extensions/Watchlist"
import { ISecurityList } from "@tradingpost/common/api/entities/interfaces"
import { Avatar, Icon } from "@ui-kitten/components"
import React, { PropsWithChildren, useEffect, useRef, useState, Component } from "react"
import { View, Text, Pressable, ScrollView, useWindowDimensions, Animated, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import { useToast } from "react-native-toast-notifications"
import { useAppUser } from "../Authentication"
import { DeleteButton, EditButton, FavButton } from "../components/AddButton"
import { ProfileBar } from "../components/ProfileBar"
import { ElevatedSection, Section, Subsection } from "../components/Section"
import { ITableColumn, Table } from "../components/Table"
import { TextField } from "../components/TextField"
import { AppColors } from "../constants/Colors"
//import { AllPages, TabScreenProps } from "../navigation"
import { elevated, flex, fonts, paddView, paddViewWhite, row, sizes } from "../style"
import { useSecuritiesList} from '../SecurityList'
import { toDollarsAndCents, toNumber1, toPercent, toPercent1, toPercent2 } from "../utils/misc"
import { MultiTermFeedPart } from "../components/MultiTermFeed"
import { ViewProps } from "react-native"


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
                    <Icon style={{ opacity: (info.item.note || !hideEmptyNote) ? (info.item.note ? 1 : 0.25) : 0, height: 16, width: 22 }} name={!shownMap[info.index] ? "file-text-outline" : "close-outline"}
                        fill={AppColors.primary}
                    /></Pressable>
            }, alias: " ", width: 32
        }
    }
}


const SecPressable = (props: PropsWithChildren<{ securityId: number }>) => {
    const nav = useNavigation<NavigationProp<AllPages>>();
    return <Pressable onPress={() => {
        nav.navigate("Company", {
            securityId: props.securityId
        })
    }}>{props.children}</Pressable>
}

export const useMakeSecurityFields = (getIdValue: (itm: any) => string | number) => {
    const { securities: { bySymbol, byId } } = useSecuritiesList();
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
                } ><Avatar style={{ marginRight: sizes.rem0_5}}
                source={
                    (() => {
                        
                        if (typeof value === "string")
                            return bySymbol[value] ? { uri: bySymbol[value].logo_url } : undefined
                        else
                            return byId[value] ? { uri: byId[value].logo_url } : undefined
                    })()}
                size="tiny" />
                    
                </SecPressable>
            </View>
            )
        },
        headerStyle: {
            width: sizes.rem10/2,    
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
        style: { lineHeight: sizes.rem1_5 },
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
    const { column, shownMap } = useNoteField(hideEmptyNote);
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
                            <View style={{justifyContent: 'space-around', flexDirection: 'row', flex: 1}}>
                                <Text>{toDollarsAndCents(a.item.price?.price)}</Text>
                                <Text style={[change ? change >= 0 ? { color: 'green'} : {color: 'red'} : {} ,{marginLeft: sizes.rem0_5/2}]}>{`(${toPercent2(change)})`}</Text>
                                
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
            },
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
            },
            column
            //        { field: "symbol", align: "left", style: { lineHeight: sizes.rem1_5 } },
        ] as ITableColumn<IWatchlistGetExt["items"][number]>[]
    }
}


export const WatchlistViewerScreen = (props: TabScreenProps<{ watchlistId: number }>) => {
    const [watchlist, setWatchlist] = useState<IWatchlistGetExt>()
    const watchlistId = props.route?.params?.watchlistId;
    const [isSaved, setIsFav] = useState(false)
    const [watchlistTickers, setWatchlistTickers] = useState<string[]>();
    const { appUser } = useAppUser();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const { shownMap, columns } = useWatchlistItemColumns(watchlist?.user[0].id !== appUser?.id);
    const translateHeaderY = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<FlatList>(null);
    /*
    const headerHeight = 154+311+74 + 5;
    const minViewHeight = windowHeight - headerHeight;
    const [collapsed, setCollapsed] = useState(false);
    const [isMaxed, setIsMaxed] = useState(false);
    const clampMax = headerHeight - ( sizes.rem1 + Number(elevated.paddingVertical) + Number(elevated.marginBottom) + sizes.rem1 + fonts.large ) ; 
    const translation = translateHeaderY.interpolate({
        inputRange: [0, clampMax],
        outputRange: [0, -clampMax],
        extrapolate: 'clamp',
    });
    useEffect(() => {
        translation.addListener((v: { value: number }) => {
            const c = Math.abs(v.value + clampMax) < 25;
            const isMaxed = -v.value === clampMax;
            setCollapsed(c);
            setIsMaxed(isMaxed);
        });
        return () => translation.removeAllListeners();
    }, [translation, clampMax]);
    */
    const toast = useToast();
    useEffect(() => {
        (async () => {
            try {
                if (watchlistId) {
                    const w = await WatchlistApi.get(watchlistId)
                        setIsFav(w.is_saved)
                        setWatchlist(w as IWatchlistGetExt);               
                    }
            } catch(err) {
                console.error(err);
            }
        })()
    }, [watchlistId])
    useEffect(()=> {
        if (watchlist) {
            setWatchlistTickers(watchlist.items.map(a => `$${a.symbol}`))
        }
    },[watchlist])
    return <View style={[flex]}> 
    <Animated.FlatList
        data={[
        <View
            //finishedLoading={Boolean(watchlist?.items)}
            style={{  paddingTop: sizes.rem0_5, backgroundColor: AppColors.background, 
            //transform: [{ translateY: translation }], 
            alignItems: "stretch", width: "100%" }}
            >
                <View style={[
                    //collapsed ? {display: 'none'} : {display: 'flex'},
                    { paddingHorizontal: sizes.rem1, backgroundColor: AppColors.background }]}>
                    <ElevatedSection
                        title={watchlist?.name || ""}
                        button={(_p) => {
                            return watchlist?.user[0].id === appUser?.id ? <EditButton {..._p} onPress={() => {
                                props.navigation.navigate("WatchlistEditor", {
                                    watchlistId: watchlistId
                                })
                            }} /> : <FavButton
                                isSelected={isSaved}
                                {..._p}
                                onPress={() => {
                                    try {
                                        if (watchlistId) {
                                            Api.Watchlist.extensions.saveWatchlist({
                                                id: watchlistId,
                                                is_saved: !isSaved
                                            })
                                            setIsFav(f => !f);
                                            toast.show("Watchlist Added")
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                            />
                        }}>
                        <ProfileBar user={watchlist?.user[0]} />
                        <Text style={[{ marginVertical: sizes.rem0_5 }, !watchlist?.note ? { color: "#ccc", fontStyle: "italic" } : undefined]}>{watchlist?.note || "No Notes"}</Text>
                    </ElevatedSection>
                </View>
                <View style={[
                    //collapsed ? {display: 'none'} : {display: 'flex'},
                    { paddingHorizontal: sizes.rem1, backgroundColor: AppColors.background }]}>
                    <ElevatedSection title="Items" >
                        <Table
                            listKey="watchlist_items"
                            data={watchlist?.items}
                            columns={columns}
                            renderAuxItem={(info) => {
                                return shownMap[info.index] && watchlist ?
                                    <NoteEditor note={info.item.note} onChangeNote={(note) => {
                                        info.item.note = note;
                                    }} canEdit={watchlist?.user[0].id === appUser?.id} ticker={info.item.symbol} watchlistId={watchlist.id} />
                                    : null
                            }}
                        />
                    </ElevatedSection>
                </View>
                <View style={[
                    { paddingHorizontal: sizes.rem1, backgroundColor: AppColors.background }]}>
                    <ElevatedSection title="Watchlist Posts"></ElevatedSection>
                </View>
        </View>,
        <View style={[{ paddingHorizontal: 0 }]} 
        //finishedLoading={Boolean(watchlistTickers)}
        >
            {watchlistTickers && <MultiTermFeedPart key={watchlistTickers ? watchlistTickers.join() : "___"} searchText={watchlistTickers}/>}
        </View>
        ]}
        renderItem={(info) => {
            return info.item;
        }}
        ref={scrollRef} contentContainerStyle={[{ paddingTop: 0 }]} nestedScrollEnabled
        /*
        onMomentumScrollEnd={(ev) => {
            if (collapsed && !isMaxed) {
                scrollRef.current?.scrollToOffset({ offset: clampMax, animated: true });
                setIsMaxed(true);
            }
        }}
        */
        onScroll={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
            { nativeEvent: { contentOffset: { y: translateHeaderY } } }
        ], { useNativeDriver: true })}>
        </Animated.FlatList>
    </View>
}

const NoteEditor = (props: { canEdit: boolean, note: string | undefined, ticker: string, watchlistId: number, onChangeNote: (note: string) => void }) => {
    const [isEdit, setIsEdit] = useState(!props.note && props.canEdit);
    const [note, setNote] = useState(props.note)

    return (!props.canEdit || (!isEdit && note)) ?
        <View style={{ flexDirection: "row", alignItems: "center" }}><Text><Text style={{ fontWeight: "bold" }}>Note:</Text>{note}</Text>
            {props.canEdit && <EditButton
                style={{ marginLeft: "auto" }}
                height={24} width={24} onPress={() => {
                    setIsEdit(true);
                }}
            />}

        </View> :
        <View style={[row, { alignItems: "center" }]}><TextField placeholder="Add a note" style={flex} value={note} onChangeText={(t) => {
            setNote(t);
        }} /><Pressable onPress={() => {
            props.onChangeNote(note || "");
            setIsEdit(false)
        }
        }><Icon name="checkmark-outline" fill={AppColors.primary} style={{
            height: 24,
            width: 24
        }} />
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