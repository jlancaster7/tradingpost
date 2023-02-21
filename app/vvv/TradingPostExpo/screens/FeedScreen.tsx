import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatListProps,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    RefreshControl,
    ScrollView,
    useWindowDimensions
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { View, Text } from "react-native";
import { PlusContentButton } from "../components/PlusContentButton";
import {
    ContentStyle,
    PostList,
    PostListOnScroll,
    PostScrollAnimEnd,
    PostScrollBegin,
    PostScrollDragBegin,
    PostScrollEnd
} from "../components/PostList";
import { spaceOnSide, postInnerHeight, postExtraVerticalSpace } from "../components/PostView";
import { DashTabScreenProps } from "../navigation/pages";
import { Logo, LogoNoBg, social } from "../images";
import { IconifyIcon } from "../components/IconfiyIcon";
import { ElevatedSection } from "../components/Section";
import { flex, sizes } from "../style";
import { social as socialStyle } from '../style'
import { SvgExpo } from "../components/SvgExpo";
import { diff } from "react-native-reanimated";

const platformsAll = ["TradingPost", "Twitter", "Substack", "Spotify", "YouTube"];

const platformsMarginH = 0.02;
const platformsMarginTop = sizes.rem1;

const useClampAmount = () => {
    const { width } = useWindowDimensions();
    return useMemo(() => (width - width * platformsMarginH * platformsAll.length * 2) / platformsAll.length + platformsMarginTop, [width]);
}

export const FeedScreen = (props: DashTabScreenProps<'Feed'>) => {
    const [platforms, setPlatforms] = useState<string[]>([]),
        [platformClicked, setPlatformClicked] = useState('');
    const nav = useNavigation();
    const clampAmount = useClampAmount();

    const translateHeaderY = useRef(new Animated.Value(0)).current;
    const lastOffsetY = useRef(new Animated.Value(0)).current;
    const translateMultipler = useRef(new Animated.Value(1)).current;


    //const [clampRange, setClampRange] = useState<[number, number]>([0, clampAmount])
    const diffValue = Animated.subtract(translateHeaderY, lastOffsetY);

    //if content is negative  
    const tester = Animated.diffClamp(translateHeaderY, 0, clampAmount)

    const currentClamp = tester.interpolate({
        inputRange: [0, clampAmount],
        outputRange: [0, -clampAmount],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        translateHeaderY.addListener((v: { value: number }) => {
            if (v.value < clampAmount)
                translateMultipler.setValue(0)
            else
                translateMultipler.setValue(1)
        })
        return () => translateHeaderY.removeAllListeners();
    }, [translateHeaderY, translateMultipler])

    useEffect(() => {
        setPlatforms((prior) => {
            if (prior.includes(platformClicked)) return prior.filter(a => a !== platformClicked)
            else if (platformClicked.length) {
                prior.push(platformClicked);
                return prior;
            } else return prior;
        })
        setPlatformClicked('')
    }, [platformClicked])


    return (
        <View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <Animated.View
                style={{
                    flex: 1,
                    // transform: [{ translateY: margin }]
                    // marginTop: margin
                }}>
                <FeedPart
                    platforms={platforms}
                    onScrollAnimationEnd={() => {
                        //translateHeaderY.setValue(-2000);ns
                        console.log("Scroll Anim Has Ended")
                    }}
                    onRefresh={() => {
                        //translateHeaderY.setValue(-1000);
                    }}
                    contentContainerStyle={{
                        paddingTop: clampAmount + sizes.rem1
                    }}
                    onScroll={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
                        {
                            nativeEvent:
                            {
                                //velocity: { y: translateHeaderY }
                                contentOffset: { y: translateHeaderY }
                            }
                        }
                    ], { useNativeDriver: true })}
                    onScrollBeginDrag={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
                        {
                            nativeEvent:
                            {
                                contentOffset: { y: lastOffsetY }
                            }

                        }
                    ], { useNativeDriver: true })}
                />
            </Animated.View>
            <PlusContentButton onPress={() => {
                nav.navigate("PostEditor")
            }} />
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    transform: [{ translateY: Animated.multiply(currentClamp, translateMultipler) }],
                    alignItems: "stretch",
                    width: "100%",
                    backgroundColor: "white",
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1
                }}
                key={`selector_${platforms.length}`}>
                <PlatformSelector platforms={platforms} setPlatformClicked={setPlatformClicked} />
            </Animated.View>
        </View>
    );
}

export const PlatformSelector = (props: { platforms: string[], setPlatformClicked: React.Dispatch<React.SetStateAction<string>> }) => {

    return (
        <View style={{ marginHorizontal: sizes.rem2 / 2, flexDirection: 'row', justifyContent: 'center' }}>
            {platformsAll.map((item) => {
                const logo = social[item + "Logo" as keyof typeof social];
                return (
                    <ElevatedSection title=""
                        key={`socialV_${item}`}
                        style={[{
                            flex: 1,
                            aspectRatio: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: platformsMarginTop,
                            marginHorizontal: "2%"
                        }, props.platforms.includes(item) ? {
                            borderStyle: 'solid',
                            borderWidth: 2,
                            borderColor: 'rgba(53, 162, 101, 1)',
                            backgroundColor: '#F0F0F0'
                        } : {}
                        ]}>
                        <Pressable style={{ flex: 1 }} onPress={() => {
                            props.setPlatformClicked(item)
                        }}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                                {item !== 'TradingPost' ?
                                    <IconifyIcon key={`social_${item}`}
                                        icon={logo}
                                        svgProps={{}}
                                        style={{
                                            aspectRatio: 1,
                                            backgroundColor: 'transparent',
                                            justifyContent: 'center'
                                        }}
                                        currentColor={item === 'Substack' ? socialStyle.substackColor : undefined} />
                                    : <SvgExpo style={{ height: "100%", aspectRatio: 1 }}>
                                        <Logo />
                                    </SvgExpo>
                                }
                            </View>
                        </Pressable>
                    </ElevatedSection>
                )
            })}
        </View>
    )
}


export const FeedPart = (props: {
    bookmarkedOnly?: boolean,
    searchTerms?: string | string[],
    dateRange?: { beginDateTime?: string, endDateTime?: string }
    userId?: string,
    platforms?: string[]
    onScroll?: PostListOnScroll
    onMomentumScrollEnd?: PostScrollEnd
    onMomentumScrollBegin?: PostScrollBegin
    onScrollBeginDrag?: PostScrollDragBegin
    onScrollAnimationEnd?: PostScrollAnimEnd
    contentContainerStyle?: ContentStyle
    onRefresh?: () => void
}) => {
    const clampAmount = useClampAmount();
    const { width: windowWidth } = useWindowDimensions();
    let { bookmarkedOnly, searchTerms, userId, platforms, dateRange } = props
    const [postsKey, setPostsKey] = useState(Date.now());
    return <PostList
        contentContainerStyle={props.contentContainerStyle}
        onScroll={props.onScroll}
        onScrollBeginDrag={props.onScrollBeginDrag}
        onMomentumScrollBegin={props.onMomentumScrollBegin}
        onMomentumScrollEnd={props.onMomentumScrollEnd}
        onScrollAnimationEnd={props.onScrollAnimationEnd}
        onRefresh={() => {
            setPostsKey(Date.now())
            if (props.onRefresh) {
                props.onRefresh();
            }
        }

        }
        onReloadNeeded={() => {
            setPostsKey(Date.now());
        }}

        key={bookmarkedOnly ? String(Date.now()) : postsKey}
        datasetKey={(searchTerms ? searchTerms instanceof Array ? searchTerms.join('') : searchTerms : "____________") + platforms?.join()}
        posts={async (allItems, page, sizeCache) => {
            console.log("PAGE: ", page)
            let reqData: any = {};
            if (searchTerms) {
                searchTerms = searchTerms instanceof Array ? searchTerms : [searchTerms];
                reqData.terms = (() => {
                    let result: string[] = []
                    searchTerms.forEach((el: string) => {
                        if (el[0] === '$') result.push(el.toLowerCase())
                        else result.push(el)
                    })
                    return result
                })()
            }
            if (platforms?.length) reqData.platforms = (() => platforms)()
            if (dateRange) {
                reqData.beginDateTime = dateRange.beginDateTime;
                reqData.endDateTime = dateRange.endDateTime;
            }
            const posts = (await Api.Post.extensions.feed({
                page,
                bookmarkedOnly: bookmarkedOnly,
                userId,
                data: Object.keys(reqData).length ? reqData : undefined
            }));

            const newItems = [...(allItems || []), ...posts]
            newItems.forEach((itm, index) => {
                if (!sizeCache[index]) {
                    sizeCache[index] = {
                        index,
                        offset: index ? (sizeCache[index - 1].offset + sizeCache[index - 1].length) : 0,
                        length: postInnerHeight(itm, Math.min(windowWidth, 680) - spaceOnSide) + postExtraVerticalSpace(itm)
                    }
                }
            })
            return newItems;
        }}
    />
}