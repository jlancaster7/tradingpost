import React, { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { Api } from '@tradingpost/common/api'
import { Tab, TabBar, TabView, Text } from "@ui-kitten/components";
//import { ensureCurrentUser } from "../apis/Authentication";
import { ProfileBanner, profileImageSize, profileImageSmall, useProfileBannerSize } from "../components/ProfileBanner";
//import { IAmiraUser } from "../interfaces/IUser";
//import { DashboardScreen, DashProps, fullDashOptions, IDashboard } from "../layouts/DashboardLayout";
//import { } from 'react-native-linear-gradient'
import { flex, fonts, paddView, row, sizes } from "../style";
import { Animated, View, ScrollView, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, Alert, FlatList, ViewStyle } from "react-native";
import { AwaitedReturn, DEV_ONLY, toThousands } from "../utils/misc";
import { SecondaryButton } from "../components/SecondaryButton";
import { ElevatedSection, Section, Subsection } from "../components/Section";
//import { PostList, usePostLoader } from "../components/PostList";
//import { getCompetitionsPast } from "../apis/CompetitionApi";
import { stringyDate, Table } from "../components/Table";
import { ChipPicker } from "../components/ChipBar";
import { PieHolder } from "../components/PieHolder";
import { WatchlistSection } from "../components/WatchlistSection";
import { TabScreenProps } from "../navigation";
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { useToast } from "react-native-toast-notifications";
import { FeedPart } from "./FeedScreen";
import { AppColors } from "../constants/Colors";
import { useMakeSecurityFields } from "./WatchlistViewerScreen";
import { PrimaryChip } from "../components/PrimaryChip";
//import { screens } from "../navigationComponents";
//import { getUser } from "../apis/UserApi";

//May need to be changed for ios
const TabPanelSize = 48;
const StatusBarsize = 20;
const ButtonMargin = 8;
const ButtonBarsize = 43;
const titles = 27 + 17;
const tabBarMargin = sizes.rem1;
const clampBuffer = 4;

const collapseShift = 2 * ButtonMargin;

export function ProfileScreen(props: TabScreenProps<{ userId: string }>) {
    const userId = props.route?.params?.userId;


    const [user, setUser] = useState<IUserGet>(),
        [watchlists, setWatchlists] = useState<AwaitedReturn<typeof Api.User.extensions.getWatchlists>>(),
        //authedUser = ensureCurrentUser(),
        translateHeaderY = useRef(new Animated.Value(0)).current;

    const dim = useWindowDimensions();
    const scrollRef = useRef<FlatList>(null);
    const
        bannerHeight = useProfileBannerSize(),
        headerHeight = bannerHeight + TabPanelSize + ButtonBarsize + ButtonMargin * 2 + titles + tabBarMargin;

    const clampMax = bannerHeight - profileImageSmall;
    //    const scrollYClamped = Animated.diffClamp(translateHeaderY, 0, clampMax);
    const minViewHeight = dim.height - clampMax - StatusBarsize - headerHeight + bannerHeight + 2 * titles;
    const [collapsed, setCollapsed] = useState(false);
    const [isMaxed, setIsMaxed] = useState(false);
    const translation = translateHeaderY.interpolate({
        inputRange: [0, clampMax],
        outputRange: [0, -clampMax],
        extrapolate: 'clamp',
    });
    const manager = useRef<boolean[]>([]).current;

    useEffect(() => {
        translation.addListener((v: { value: number }) => {
            const c = Math.abs(v.value + clampMax) < profileImageSize - profileImageSmall + 8;
            const isMaxed = -v.value === clampMax;
            setCollapsed(c);
            setIsMaxed(isMaxed);
        });
        return () => translation.removeAllListeners();
    }, [translation, clampMax]);

    const [tab, setTab] = useState(0);
    //const dashRef = useRef<any>()
    const toast = useToast();

    useEffect(() => {

        if (userId) {
            (async () => {
                try {
                    const [user, watchlists] = await Promise.all([
                        Api.User.get(userId),
                        Api.User.extensions.getWatchlists({ userId: userId as string })
                    ]);//await getUser({ user_id: userId });

                    setWatchlists(watchlists);
                    setUser(user);

                } catch (ex: any) {
                    toast.show(ex.message);
                }
            })()
        }

    }, [userId])

    return <View style={[flex]}>
        <Animated.FlatList
            data={[
                <ProfilePage
                    style={{ paddingHorizontal: 0 }} index={0} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                    <FeedPart
                        userId={userId}
                    />
                </ProfilePage>,
                <ProfilePage index={1} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                    <PieHolder />
                    <ElevatedSection title="Holdings">
                    </ElevatedSection>
                    <WatchlistSection title="Watchlists" watchlists={watchlists} />
                    {/* <WatchlistSection parentComponentId={props.componentId} userId={props.userId} /> */}
                </ProfilePage>,
                <ProfilePage index={2} minViewHeight={minViewHeight} manager={manager} currentIndex={tab} >
                    <ElevatedSection title="">
                        <Table


                            keyExtractor={(item, idx) => {
                                return item ? "trade_" + idx : "empty";
                            }}
                            data={(async (a, $page) => {
                                const newArr = a || [];
                                newArr.push(... (await Api.User.extensions.getTrades({ $page, $limit: 20, settings: { user_id: userId } })))
                                console.log(JSON.stringify(newArr))
                                return newArr;
                            })}
                            columns={[
                                ...useMakeSecurityFields((item: any) => {
                                    return Number(item.security_id)
                                }),
                                { field: "date", stringify: (a, b, c) => String(a) },
                                { field: "quantity", stringify: toThousands },
                                { field: "price", stringify: toThousands }
                            ]}

                        />
                    </ElevatedSection>
                </ProfilePage>,
                <ProfilePage index={3} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                    <ElevatedSection title="General">
                        <Subsection title="Biography">
                            <Text>{user?.bio}</Text>
                        </Subsection>
                        <View style={row} >
                            <Subsection title="Strategy" style={flex}>
                                <Text>{user?.analyst_profile?.investment_strategy}</Text>
                            </Subsection>
                            <Subsection title="Benchmark" style={flex}>
                                <Text>{user?.analyst_profile?.benchmark}</Text>
                            </Subsection>
                        </View>
                        <Subsection title="Interest &amp; Specialities" style={flex}>
                            <View style={{ flexDirection: "row" }}>
                                {(user?.analyst_profile?.interests || ["No", "Tags", "Here"]).map((chip, i) =>
                                    <PrimaryChip isAlt key={i} label={chip} style={{ flex: 1 }} />)}
                            </View>
                        </Subsection>
                    </ElevatedSection>
                    {/* <ElevatedSection title="Competitions">
                        <Table elevated data={[]} columns={
                            [
                                {
                                    field: "name",
                                    align: "left"
                                },
                                {
                                    field: "position",
                                    alias: "# Rank",
                                    width: 128
                                },
                                {
                                    field: "endDate",
                                    stringify: stringyDate,
                                    width: 72
                                }
                            ]} />
                    </ElevatedSection> */}
                    <ElevatedSection title="Social Analytics"></ElevatedSection>
                </ProfilePage>
            ]}
            renderItem={(info) => {
                return info.item;
            }}
            ref={scrollRef} contentContainerStyle={[{ paddingTop: headerHeight }]} nestedScrollEnabled
            onMomentumScrollEnd={(ev) => {
                if (collapsed && !isMaxed) {

                    scrollRef.current?.scrollToOffset({ offset: clampMax, animated: true });
                    setIsMaxed(true);
                }
            }}
            onScroll={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
                { nativeEvent: { contentOffset: { y: translateHeaderY } } }
            ], { useNativeDriver: true })}>
        </Animated.FlatList>
        <Animated.View style={{ position: "absolute", top: 0, backgroundColor: AppColors.background, transform: [{ translateY: translation }], alignItems: "stretch", width: "100%" }}>
            {/* <ElevatedSection style={{ alignItems: "center", width:"100%" }} title=""> */}
            <ProfileBanner navigator={props.navigation} profilePic={user?.profile_url} collapse={collapsed}
                bannerPic={""}
                extraMarginTop={collapseShift}
                platforms={user?.claims ? user?.claims.map(c => c.platform) : []}

            />
            <View style={[collapsed ? row : undefined, { width: "100%", alignItems: "center" }]}>
                <View style={{ marginLeft: collapsed ? sizes.rem1 : 0 }}>
                    <Text style={{ color: "black", textAlign: !collapsed ? "center" : "left", fontSize: fonts.xSmall }}>@{user?.handle || ""}</Text>
                    <Text style={{ color: "black", textAlign: !collapsed ? "center" : "left", fontSize: fonts.medium }}>{user?.display_name}</Text>
                </View>
                <SecondaryButton style={{
                    width: "50%", marginVertical: ButtonMargin,
                    marginLeft: "auto", marginRight: collapsed ? sizes.rem1 : "auto"
                }} >Subscribe</SecondaryButton>
            </View>
            {/* </ElevatedSection> */}
            <ElevatedSection title="" style={{ marginHorizontal: sizes.rem1, marginTop: tabBarMargin }} >
                <TabBar
                    indicatorStyle={{
                        marginTop: 26
                    }}
                    style={{ width: "100%" }}
                    selectedIndex={tab}
                    onSelect={t => {
                        if (collapsed)
                            scrollRef.current?.scrollToOffset({ offset: clampMax, animated: false });

                        setTab(t);
                    }}>
                    {["Posts", "Portfolio", "Trades", "About"].map(t => <Tab style={{ marginTop: -4 }} title={t} />)}
                </TabBar>
            </ElevatedSection>
        </Animated.View>
    </View>


    {/* </ScrollView> */ }
}

function ProfilePage(props: { manager: boolean[], index: number, currentIndex: number, minViewHeight: number, children?: ReactNode, style?: ViewStyle }) {
    props.manager[props.currentIndex] = true;
    return (props.index === props.currentIndex || props.manager[props.index]) ?
        <View style={[paddView, {
            minHeight: props.minViewHeight,
            display: props.currentIndex === props.index ? "flex" : "none",

        }, props.style]}>
            {props.children}
        </View> : null
}
