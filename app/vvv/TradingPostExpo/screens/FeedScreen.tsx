import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, useWindowDimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { View, Text } from "react-native";
import { PlusContentButton } from "../components/PlusContentButton";
import { PostList } from "../components/PostList";
import { spaceOnSide, postInnerHeight } from "../components/PostView";
import { DashTabScreenProps } from "../navigation/pages";
import { Logo, LogoNoBg, social } from "../images";
import { IconifyIcon } from "../components/IconfiyIcon";
import { ElevatedSection } from "../components/Section";
import { flex, sizes } from "../style";
import { List } from "../components/List";
import { Avatar } from "@ui-kitten/components";
import { social as socialStyle } from '../style'
import { SvgExpo } from "../components/SvgExpo";

export const FeedScreen = (props: DashTabScreenProps<'Feed'>) => {
    const [platforms, setPlatforms] = useState<string[]>([]),
        [platformClicked, setPlatformClicked] = useState('');
    const nav = useNavigation();

    useEffect(() => {
        setPlatforms((prior) => {
            if (prior.includes(platformClicked)) return prior.filter(a => a !== platformClicked)
            else if (platformClicked.length) {
                prior.push(platformClicked);
                return prior;
            }
            else return prior;
        })
        setPlatformClicked('')
    }, [platformClicked])
    return (
        <View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <View key={`selector_${platforms.length}`}>
                <PlatformSelector platforms={platforms} setPlatformClicked={setPlatformClicked} />
            </View>
            <FeedPart />
            <PlusContentButton onPress={() => {
                nav.navigate("PostEditor")
            }} />
        </View>
    );
}

export const PlatformSelector = (props: { platforms: string[], setPlatformClicked: React.Dispatch<React.SetStateAction<string>> }) => {
    let { width: windowWidth } = useWindowDimensions();
    windowWidth = windowWidth > 680 ? 680 : windowWidth
    return (
        <View style={{ marginHorizontal: sizes.rem2 / 2, flexDirection: 'row', justifyContent: 'center' }}>
            {["TradingPost", "Twitter", "Substack", "Spotify", "YouTube"].map((item) => {
                const logo = social[item + "Logo" as keyof typeof social];
                return (
                    <ElevatedSection title=""
                        key={`socialV_${item}`}
                        style={[{
                            flex: 1,
                            aspectRatio: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: sizes.rem1,
                            marginHorizontal: -0.25 * ((windowWidth - 320) ** (1 / 3)) + 0.0002 * ((windowWidth - 320) ** (1 / 2)) + 0.083 * ((windowWidth - 320) ** (1)) + 4,

                        }, props.platforms.includes(item) ? { borderStyle: 'solid', borderWidth: 2, borderColor: 'rgba(53, 162, 101, 1)', backgroundColor: '#F0F0F0' } : {}
                        ]}

                    >
                        <Pressable style={{ flex: 1 }} onPress={() => {
                            props.setPlatformClicked(item)
                        }}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                                {item !== 'TradingPost' ?
                                    <IconifyIcon key={`social_${item}`}
                                        icon={logo}
                                        svgProps={{}}

                                        style={{ aspectRatio: 1, backgroundColor: 'transparent', justifyContent: 'center' }}
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
    userId?: string,
    platforms?: string[]
}) => {
    const { width: windowWidth } = useWindowDimensions();
    let { bookmarkedOnly, searchTerms, userId, platforms } = props
    searchTerms = searchTerms === undefined ? searchTerms : (searchTerms instanceof Array ? searchTerms : [searchTerms])
    const [postsKey, setPostsKey] = useState(Date.now());
    return <PostList
        onRefresh={() => setPostsKey(Date.now())}

        onReloadNeeded={() => {
            setPostsKey(Date.now());
        }}
        key={bookmarkedOnly ? String(Date.now()) : postsKey}
        datasetKey={searchTerms ? searchTerms.join('') : "____________"}
        posts={async (allItems, page, sizeCache) => {
            console.log("PAGE: ", page)
            let reqData: any = {};
            if (searchTerms) {
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
                        offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                        length: postInnerHeight(itm, Math.min(windowWidth, 680) - spaceOnSide)
                    }
                }
            })
            return newItems;
        }}
    />
}