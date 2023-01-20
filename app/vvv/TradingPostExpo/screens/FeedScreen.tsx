import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";
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
    const [searchText, setSearchText] = useState(""),
          [platforms, setPlatforms] = useState<string[]>([]),
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
    },[platformClicked])
    return (
        <View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <FlatList
                data={[
                    <View key={`selector_${platforms.length}`}>
                        <PlatformSelector  platforms={platforms} setPlatformClicked={setPlatformClicked}/>
                    </View>
                    ,
                    <View key={`feed_${platforms.length}`}>
                        <FeedPart platforms={platforms} bookmarkedOnly={props.route.params.bookmarkedOnly === "true"} searchText={searchText} />
                    </View>
                ]}
                renderItem={(info) => {
                    return info.item
                }}
                contentContainerStyle={[{ paddingTop: 10 }]} 
                nestedScrollEnabled
                />
            
            <PlusContentButton onPress={() => {
                nav.navigate("PostEditor")
            }} />
        </View>
    );
}

export const PlatformSelector = (props: {platforms: string[], setPlatformClicked: React.Dispatch<React.SetStateAction<string>>}) => {
    return (
        <View style={{marginHorizontal: sizes.rem2 / 2, flexDirection: 'row', justifyContent: 'center'}}>
            {["TradingPost", "Twitter", "Substack", "Spotify", "YouTube"].map((item) => {
                const logo = social[item + "Logo" as keyof typeof social];
                    return (
                        <ElevatedSection title="" 
                                        key={`socialV_${item}`} 
                                        style={[{ flex: 1,
                                                    aspectRatio: 1,
                                                    alignSelf: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: sizes.rem1,
                                                    marginHorizontal: 8,
                                                    
                                                }, props.platforms.includes(item) ? {borderStyle: 'solid', borderWidth: 2 ,borderColor: 'rgba(53, 162, 101, 1)',  backgroundColor: '#F0F0F0'} : {}
                                                ]}
                                        
                                                >
                            <Pressable style={{flex: 1}} onPress={() =>{
                                props.setPlatformClicked(item)
                            }}>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                                    { item !== 'TradingPost' ? 
                                        <IconifyIcon key={`social_${item}`} 
                                                    icon={logo} 
                                                    svgProps={{  }}
                                                    
                                                    style={{  aspectRatio: 1, backgroundColor: 'transparent' }}
                                                    currentColor={item === 'Substack' ? socialStyle.substackColor : undefined} />
                                                    :  <SvgExpo style={{ height: "100%", aspectRatio: 1 }}>
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
    searchText?: string,
    userId?: string,
    platforms?: string[]
}) => {
    const { width: windowWidth } = useWindowDimensions();
    const { bookmarkedOnly, searchText, userId, platforms } = props

    const [postsKey, setPostsKey] = useState(Date.now());
    console.log(platforms)
    return <PostList
        onReloadNeeded={() => {
            setPostsKey(Date.now());
        }}
        key={bookmarkedOnly ? String(Date.now()) : postsKey}
        datasetKey={searchText ? searchText : "____________"}
        posts={async (allItems, page, sizeCache) => {
            console.log("PAGE: ", page)
            let reqData: any = {};
            if (searchText) {
                reqData.terms = (() => {
                    if (searchText[0] === '$') return searchText.toLowerCase() 
                    else return searchText
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