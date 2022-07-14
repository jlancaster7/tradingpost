import React, { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { TabView, Text } from "@ui-kitten/components";
//import { ensureCurrentUser } from "../apis/Authentication";
import { ProfileBanner, profileImageSize, profileImageSmall, useProfileBannerSize } from "../components/ProfileBanner";
//import { IAmiraUser } from "../interfaces/IUser";
//import { DashboardScreen, DashProps, fullDashOptions, IDashboard } from "../layouts/DashboardLayout";
//import { } from 'react-native-linear-gradient'
import { flex, fonts, paddView, row, sizes } from "../style";
import { Animated, View, ScrollView, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, Alert, FlatList, ViewStyle } from "react-native";
import { DEV_ONLY } from "../utils/misc";
import { SecondaryButton } from "../components/SecondaryButton";
import { Section, Subsection } from "../components/Section";
import { PostList, usePostLoader } from "../components/PostList";
//import { getCompetitionsPast } from "../apis/CompetitionApi";
import { stringyDate, Table } from "../components/Table";
import { ChipPicker } from "../components/ChipBar";
import { PieHolder } from "../components/PieHolder";
import { WatchlistSection } from "../components/WatchlistSection";
//import { screens } from "../navigationComponents";
//import { getUser } from "../apis/UserApi";

//May need to be changed for ios
const TabPanelSize = 48;
const StatusBarsize = 20;
const ButtonMargin = 8;
const ButtonBarsize = 43;
const titles = 27 + 17;
const clampBuffer = 4;

const collapseShift = 2 * ButtonMargin;

export function ProfileScreen(props: { userId: string }) {
    const { userId } = props;

    const [user, setUser] = useState<any>(),
        //authedUser = ensureCurrentUser(),
        translateHeaderY = useRef(new Animated.Value(0)).current;

    const dim = useWindowDimensions();
    const scrollRef = useRef<FlatList>(null);
    const
        bannerHeight = useProfileBannerSize(),
        headerHeight = bannerHeight + TabPanelSize + ButtonBarsize + ButtonMargin * 2 + titles;

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
    const dashRef = useRef<any>(),
        postLoader = usePostLoader(10, [], false, userId, (msg) => {
            dashRef.current?.toastMessage(msg)
        });

    useEffect(() => {
        //DEV_ONLY(() => {

        (async () => {
            try {
                const user = null;//await getUser({ user_id: userId });
                setUser(user);
            } catch (ex: any) {
                dashRef.current?.toastMessage(ex.message)
            }
        })()

    }, [userId])



    return <TabView
            onSelect={(t) => {
                if (collapsed)
                    scrollRef.current?.scrollToOffset({ offset: clampMax, animated: false });

                setTab(t);
            }}
            items={["About", "Posts", "Portfolio", "Trades"].map(t => ({ label: t }))}>
            <View style={[flex, { backgroundColor: "white" }]}>
                <Animated.FlatList
                    data={[
                        <ProfilePage index={0} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                            <Subsection title="Biography" alt>
                                <Text>{user?.bio}</Text>
                            </Subsection>
                            <View style={row} >
                                <Subsection title="Strategy" style={flex} alt>
                                    <Text>{user?.trading_strategies?.join("\r\n")}</Text>
                                </Subsection>
                                <Subsection title="Asset Class" style={flex} alt>
                                    <Text>{ }</Text>
                                </Subsection>
                            </View>
                            <Subsection title="Custom Labels" style={flex} alt>
                                <ChipPicker choices={[]} defaultValues={user?.chip_labels?.map(v => ({ value: v, label: v })) || []} />
                            </Subsection>
                            <Section title="Competitions">
                                <Table elevated data={getCompetitionsPast} columns={
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
                            </Section>
                            <Section title="Social Analytics"></Section>
                        </ProfilePage>,
                        <ProfilePage style={{ paddingHorizontal: 0 }} index={1} minViewHeight={minViewHeight} manager={manager} currentIndex={tab}>
                            <PostList
                                posts={postLoader}
                                componentId={props.componentId} />
                        </ProfilePage>,
                        <ProfilePage index={2} minViewHeight={minViewHeight} manager={manager} currentIndex={tab} >
                            <PieHolder />
                            <Section title="Holdings">
                                <Text>Need Details</Text>
                            </Section>
                            <WatchlistSection parentComponentId={props.componentId} userId={props.userId} />
                        </ProfilePage>,
                        <ProfilePage index={3} minViewHeight={minViewHeight} manager={manager} currentIndex={tab} >
                            <Section title="Trading Stats"></Section>
                            <Section title="New/Closed Positions"></Section>
                            <Section title="Composition Trades"></Section>
                            <Section title="Trades"></Section>
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
                <Animated.View style={{ position: "absolute", top: 0, transform: [{ translateY: translation }], alignItems: "center", backgroundColor: "white" }}>
                    <ProfileBanner profilePic={user?.picture_url} collapse={collapsed}
                        bannerPic={""}
                        componentId={props.componentId}
                        extraMarginTop={collapseShift} />
                    <View style={[collapsed ? row : undefined, { width: "100%", alignItems: "center" }]}>
                        <View style={{ marginLeft: collapsed ? sizes.rem1 : 0 }}>
                            <Text style={{ color: "black", textAlign: !collapsed ? "center" : "left", fontSize: fonts.xSmall }}>@{user?.username}</Text>
                            <Text style={{ color: "black", textAlign: !collapsed ? "center" : "left", fontSize: fonts.medium }}>{user?.first_name} {user?.last_name}</Text>
                        </View>
                        <SecondaryButton label={"Subscribe"} style={{
                            width: "50%", marginVertical: ButtonMargin,
                            marginLeft: "auto", marginRight: collapsed ? sizes.rem1 : "auto"
                        }} />
                    </View>
                    <TabController.TabBar />
                </Animated.View>
            </View>
        </TabController >

        {/* </ScrollView> */}
    </DashboardScreen >
}

function ProfilePage(props: { manager: boolean[], index: number, currentIndex: number, minViewHeight: number, children?: ReactNode, style?: ViewStyle }) {
    props.manager[props.currentIndex] = true;
    return (props.index === props.currentIndex || props.manager[props.index]) ?
        <View style={[paddView, {
            minHeight: props.minViewHeight,
            display: props.currentIndex === props.index ? "flex" : "none",
            backgroundColor: "white"
        }, props.style]}>
            {props.children}
        </View> : null
}

export const openProfileScreen = (componentId: string, userId: string) => {
    screens.push(componentId, "Profile", {
        options: fullDashOptions,
        passProps: { isFullscreen: true, userId }
    })
}