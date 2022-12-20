import React, { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    ImageBackground,
    Linking,
    PixelRatio,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { Button, Icon } from '@ui-kitten/components'

import { flex, fonts, row, shadow, sizes } from '../style'

import { IconifyIcon } from './IconfiyIcon'
import { Header, Subheader } from './Headers'
import { PrimaryChip } from './PrimaryChip'
import { BookmarkActive, BookmarkIcons, CommentIcon, navIcons, postBg, social, UpvoteIcon, Retweet, PremiumStar } from '../images'
import { social as socialStyle } from '../style'
import { IconButton } from './IconButton'
//import { IPostList } from '../api/entities/interfaces'
import { LogoImage } from './LogoImage'
//import { ensureCurrentUser } from '../apis/Authentication'
//import { WebView } from 'react-native-webview';
import { color } from 'react-native-reanimated'
//import { screens } from '../navigationComponents'
//import { fullDashOptions } from '../layouts/DashboardLayout'
import { toFormatedDateTime } from '../utils/misc'
import { AsyncPressable } from './AsyncPressable'
import { AppColors } from '../constants/Colors'
import { Api, Interface } from '@tradingpost/common/api'
import { HtmlView } from './HtmlView'
import { useWindowDimensions } from 'react-native'
import { ProfileButton } from './ProfileButton'
import { useToast } from 'react-native-toast-notifications'
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { RootStackParamList } from '../navigation/pages'

//import { setBookmarked } from '../apis/PostApi'
//import { openProfileScreen } from '../screens/ProfileScreen'
import { WebView } from "react-native-webview";
import { ShareButton } from './ShareButton'


const postTotalVerticalMargin = sizes.rem1;
const postTotalHorizontalMargin = sizes.rem2;
const postSidePad = sizes.rem2;
const postTotalBorder = 2//4;
export const spaceOnSide = postTotalHorizontalMargin + postTotalBorder + postSidePad

export const postInnerHeight = (itm: Interface.IElasticPost | undefined, windowWidth: number) => {
    const size = (itm as Interface.IElasticPost | undefined)?._source.size
    if (itm?._source.postType === "substack") {
        return 200;
    } else if (itm?._source.postType === "tradingpost" && size) {
        return (windowWidth / size.aspectRatio) * (fonts.small / fonts.xSmall) + fonts.medium
    } else if (size) {
        return windowWidth / size.aspectRatio + (itm?._source.postType === "tweet" ? 20 * windowWidth / itm._source.size.maxWidth : 0);
    } else if (itm?._source.postType === "youtube") {
        return windowWidth / (390 / 230);
    } else if (itm?._source.postType === "spotify") {
        return windowWidth / (360 / 162);
    } else {
        return 200;
    }
}
export const resolvePostContent = (itm: Interface.IElasticPost | undefined, windowWidth: number) => {
    switch (itm?._source.postType) {
        case "youtube":
            return "https:" + itm._source.postUrl.replace("https://www.youtube.com/watch?v=", "//www.youtube.com/embed/");
        case 'tweet':
            return `<html><head>
            <style>
            .blink_me {
                animation: blinker 1s linear infinite;
              }
              
              @keyframes blinker {
                50% {
                  opacity: 0;
                }
              }
            </style>
            <script>                
                const tracker = setInterval(()=>{
                    if(document.querySelector(".twitter-tweet-rendered")){
                        clearInterval(tracker);  
                        document.getElementById("wrapper").style.opacity=1;
                        document.getElementById("loader").style.opacity=0.99;
                        setTimeout(()=>{
                            document.getElementById("loader").style.display="none";
                        },2000)
                    }
                },333)    

            </script><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"></meta></head>
            <body style="margin:0; padding:0;width:${itm._source.size.maxWidth}px;transform: scale(${Math.min(windowWidth, 680) / itm._source.size.maxWidth});transform-origin: top left;">
            <div id="loader" style="background-color:white; position:absolute; height:100%; width:100%">
             <img class="blink_me" style="position:absolute; margin:auto; left:0; right:0; top:0; bottom:0; height:40px; width:40px" src="data:image/svg+xml,%3c%3fxml version='1.0' encoding='UTF-8'%3f%3e %3csvg xmlns='http://www.w3.org/2000/svg' xml:space='preserve' viewBox='0 0 248 204'%3e%3cpath fill='%231d9bf0' d='M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z'/%3e%3c/svg%3e" />
            </div>
            <div id="wrapper" style="opacity:0; min-height:${itm._source.size.maxWidth / itm._source.size.aspectRatio}px">
            ${itm._source.content.htmlBody}
            </div>
            </body></html>`
        case 'spotify':
            const matches = /src="(.*)"/.exec(itm._source.content.body);
            return matches?.[1] || "";
        case 'tradingpost':
            return `
                <html><meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <body>
                        <div style="font-size: ${fonts.medium}px; font-weight: 600px; line-height: ${fonts.medium * 1}px; margin-bottom: 10px">${itm._source.content.title}</div>
                        <div style="font-size: ${fonts.small}px; margin: 0px 3px 0px">${itm._source.content.body}</div>
                    </body>    
                </html>
                `
        case 'substack':
        //return SubstackView({post: itm});

        /*
        return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"></meta></head>
        <body style="margin:0; padding:0;width:${itm?._source.size.maxWidth}px;transform: scale(${windowWidth / itm._source.size.maxWidth});transform-origin: top left;">
        <h1>${itm?._source.content.title}</h1>
        <p>${itm?._source.content.body}</p>
        </body></html>`
        */


        default:
            return itm?._source.content.htmlBody || "";
    }
}

export function PostView(props: { post: Interface.IElasticPostExt }) {
    const { post } = props
    const nav = useNavigation<NavigationProp<RootStackParamList>>();

    const [isBookmarked, setIsBookmarked] = useState(Boolean(post.ext.is_bookmarked));
    const [isUpvoted, setIsUpvoted] = useState(Boolean(post.ext.is_upvoted));
    const [upvoteCount, setUpvoteCount] = useState(post.ext.upvoteCount || 0);
    // useEffect(() => {
    //     Api.Post.extensions.getUpvotes({id: props.post._source.id, count: 0})
    //         .then((r) => {
    //             setUpvoteCount(r.count);
    //         })
    // }, [])
    const [showStatus, setShowStatus] = useState(false);
    return <View style={{ marginHorizontal: postTotalHorizontalMargin / 2, marginVertical: postTotalVerticalMargin / 2 }}>
        <View
            style={[shadow, {
                backgroundColor: "white",
                borderRadius: sizes.borderRadius * 4,
                borderColor: "#ccc",
                borderWidth: postTotalBorder / 2
            }]}>
            <Pressable
                onPress={() => {
                    //openProfileScreen(props.parentComponentId, props.post.creator.id_creator);
                }} style={[row, {
                    alignItems: "center",
                    overflow: "hidden",
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                    padding: sizes.rem1 / 2
                }]}>
                {
                    <ProfileButton userId={props.post._source.user.id}
                        profileUrl={props.post.ext.user?.profile_url || ""} size={48} />
                }
                <View style={[flex, { marginLeft: sizes.rem1 }]}>
                    <Pressable onPress={() => {
                        if (props.post._source.user.id)
                            nav.navigate("Profile", {
                                userId: props.post._source.user.id
                            } as any);
                    }}
                    >
                        <Subheader text={"@" + (props.post.ext.user?.handle || "NoUserAttached")}
                            style={{ color: "black", fontWeight: "bold" }} />
                    </Pressable>
                    <View style={{ marginRight: 10 }}>
                        <ScrollView nestedScrollEnabled horizontal showsHorizontalScrollIndicator={false}>
                            <View style={[row, props.post.ext.user?.tags ? { display: 'flex' } : { display: 'none' }]}>
                                {props.post.ext.user?.tags && (props.post.ext.user?.tags).map((chip, i) =>
                                    <PrimaryChip isAlt key={i} label={chip} />)}
                            </View>
                        </ScrollView>
                    </View>
                </View>
                <AsyncPressable
                    onPress={async () => {
                        try {
                            const resp = await Api.Post.extensions.setBookmarked({
                                id: props.post._id,
                                is_bookmarked: !isBookmarked
                            });
                            setIsBookmarked(Boolean(resp.is_bookmarked));
                        } catch (ex) {
                            console.error(ex);
                        }
                    }}>
                    {!isBookmarked && <IconButton iconSource={BookmarkIcons.inactive}
                        style={{ height: 28, width: 28, marginLeft: "auto" }} />}
                    {isBookmarked && <BookmarkActive
                        style={{ height: 28, width: 28, marginLeft: "auto", marginRight: sizes.rem0_5 / 2 }} />}
                </AsyncPressable>
            </Pressable>
            {
                ["substack", "tradingpost"].includes(post._source.postType) ?
                    <Pressable onPress={() => {
                        nav.navigate("PostScreen", {
                            post,
                            id: post._id
                        })

                    }} style={{ paddingHorizontal: postSidePad / 2 }}>
                        <PostContentView post={post} />
                    </Pressable> :
                    <View style={{ paddingHorizontal: postSidePad / 2 }}>
                        <PostContentView post={post} />
                    </View>
            }

            {(props.post._source.postType !== "tweet") &&
                <View
                    style={[row, { alignItems: "center", marginTop: "auto", borderTopColor: "#ccc", borderTopWidth: 1 }]}>
                    {showStatus && <View style={{
                        position: "absolute",
                        backgroundColor: "black",
                        //   opacity: 0.6,
                        width: 100,
                        margin: "auto",
                        top: 12,
                        left: 0,
                        borderRadius: 8,
                        right: 0,
                        padding: 4
                    }}><Text style={{ width: "100%", textAlign: "center", color: "white" }}>Upvoted!</Text></View>}
                    <Button
                        style={{ marginLeft: "auto", paddingLeft: 10, paddingRight: 0 }}
                        appearance={'ghost'}
                        accessoryLeft={(props: any) =>
                            <CommentIcon height={24} width={24} style={{ height: 24, width: 24, }} />
                        }
                        onPress={() => {
                            nav.navigate("PostScreen", {
                                post, id: post._id
                            })
                        }}
                    >
                        {evaProps => <Text {...evaProps}
                            style={{
                                fontWeight: 'normal',
                                paddingLeft: sizes.rem1,
                                paddingRight: sizes.rem0_5,
                                color: '#9D9D9D'
                            }}>
                            {'-'}
                        </Text>}
                    </Button>
                    {<Button
                        style={{ paddingLeft: 10, paddingRight: 0 }}
                        onPress={() => {
                            if (!isUpvoted)
                                setShowStatus(true);
                            Api.Post.extensions.setUpvoted({
                                id: post._id,
                                is_upvoted: !isUpvoted,
                                count: upvoteCount // return number of upvotes. 
                            }).then((r) => {
                                if (r.is_upvoted)
                                    setTimeout(() => {
                                        setShowStatus(false)
                                    }, 1333);
                                setUpvoteCount(r.count);
                                setIsUpvoted(r.is_upvoted);
                            });
                        }}
                        accessoryLeft={(props: any) => <UpvoteIcon height={24} width={24} style={{
                            height: 24,
                            width: 24,
                            // opacity: isUpvoted ? 1 : 0.25
                        }} />} appearance={"ghost"}>
                        {evaProps => <Text {...evaProps} style={{
                            fontWeight: 'normal',
                            paddingHorizontal: sizes.rem1,
                            color: '#9D9D9D'
                        }}>{upvoteCount}</Text>}
                    </Button>}
                    <ShareButton url={"https://m.tradingpostapp.com/post?id=" + props.post._id} title={"https://m.tradingpostapp.com/post?id=" + props.post._id} style={{
                        height: 24,
                        width: 24, marginRight: 10
                    }} />
                </View>}
        </View>
    </View>
}

const SubstackView = (props: { post: Interface.IElasticPost }) => {
    const { post } = props;
    return <View style={{ marginVertical: sizes.rem1 / 2, marginHorizontal: sizes.rem0_5 }}>
        <View key="profile">
            {/* <Image style={{ aspectRatio: 0.9, marginRight: sizes.rem1 / 2 }} source={{ uri: post.platform_profile_url }} /> */}
            <Pressable onPress={() => {
                Linking.openURL(post._source.postUrl)
            }}
                style={{
                    marginBottom: sizes.rem0_5,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: 'center'
                }}>
                <IconifyIcon style={{ width: 30, height: 30, marginTop: 2, marginRight: sizes.rem1 / 1.5 }}
                    svgProps={{ style: { margin: "auto" } }} icon={social.SubstackLogo}
                    currentColor={socialStyle.substackColor} />
                {<Subheader text={post._source.content.title || ""} style={{
                    marginBottom: 0,
                    display: "flex",
                    color: "black",
                    fontSize: fonts.medium,
                    fontWeight: "600",
                    fontFamily: "K2D",
                    maxWidth: "85%"
                }}></Subheader>}
            </Pressable>
        </View>
        {<Text key="content" style={{ fontSize: fonts.small }}>
            {(() => {
                const parsedText = parseHtmlEnteties(post._source.content.description);
                return parsedText?.length > 300 ?
                    `${parsedText.substring(0, 300)}...` :
                    parsedText
            })()}
        </Text>}
        {<Text key="date" style={{
            fontSize: fonts.xSmall,
            fontFamily: "K2D",
            paddingVertical: 5
        }}>{toFormatedDateTime(post._source.platformCreatedAt)}</Text>}
    </View>
}

const TradingPostView = (props: { post: Interface.IElasticPost }) => {
    const { post } = props;
    return <View style={{ marginVertical: sizes.rem1 / 2, marginHorizontal: sizes.rem0_5 }}>
        <View key="profile">
            {/* <Image style={{ aspectRatio: 0.9, marginRight: sizes.rem1 / 2 }} source={{ uri: post.platform_profile_url }} /> */}

            <Subheader text={post._source.content.title || ""} style={{
                marginBottom: 0,
                display: "flex",
                color: "black",
                fontSize: fonts.medium,
                fontWeight: "600",
                fontFamily: "K2D",
                maxWidth: "85%"
            }}></Subheader>

        </View>
        <HtmlView key="content" isUrl={false} style={{ height: props.post._source.size.aspectRatio }}>
            {`<html><meta name="viewport" content="width=device-width, initial-scale=1.0">
                <body style="font-size: ${fonts.small}px">${post._source.content.body}</body></html>`}
            {/*(() => {
                const parsedText = parseHtmlEnteties(post._source.content.body);
                return parsedText?.length > 300 ?
                    `${parsedText.substring(0, 300)}...` :
                    parsedText
            })()*/}
        </HtmlView>
        {<Text key="date" style={{
            fontSize: fonts.xSmall,
            fontFamily: "K2D",
            paddingVertical: 5
        }}>{new Date(Date.parse(post._source.platformCreatedAt)).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })}</Text>}
    </View>
}
const parseHtmlEnteties = (str: string) => {
    return str?.replace(/&#([0-9]{1,4});/gi, function (match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
}

const PostContentView = (props: { post: Interface.IElasticPost }) => {
    const { width: windowWidth, scale } = useWindowDimensions(),
        availWidth = Math.min(windowWidth, 680) - spaceOnSide

    if (props.post._source.postType === 'substack') {
        return SubstackView(props)
    }

    return <View>
        <View style={{
            display: (props.post._source.postType === 'tweet' && props.post._source.content.body.slice(0, 2) === 'RT') ? 'flex' : 'none',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 2,
            marginBottom: -5
        }}>
            <Retweet width={30} height={30} style={{ width: 30, height: 30 }} />
            <Text style={{
                fontWeight: '500',
                marginLeft: 2
            }}>
                {'Retweet'}
            </Text>
        </View>
        <View>
            {props.post._source.subscription_level === 'premium' && <PremiumStar style={{ height: 24, width: 24, marginBottom: 5, marginTop: 10 }} />}
        </View>
        <View style={{
            height: postInnerHeight(props.post, availWidth),
            paddingVertical: ['spotify', 'youtube'].includes(props.post._source.postType) ? sizes.rem0_5 : 0
            //height: postInnerHeight(props.post, availWidth),
            //justifyContent: ['spotify', 'youtube'].includes(props.post._source.postType) ? 'center' : undefined
        }}>
            <HtmlView style={{
                height: ['spotify', 'youtube'].includes(props.post._source.postType) ? postInnerHeight(props.post, availWidth) : postInnerHeight(props.post, availWidth),
                //height: postInnerHeight(props.post, availWidth)
                //marginTop: ['spotify', 'youtube'].includes(props.post._source.postType) ? 8 : 0,
                //marginBottom: ['youtube', 'spotify'].includes(props.post._source.postType) ? 8 : 0
            }}
                isUrl={props.post._source.postType === "youtube" || props.post._source.postType === "spotify"}>
                {resolvePostContent(props.post, availWidth)}
            </HtmlView>
        </View>
        <View>
            {props.post._source.postType === 'tradingpost' &&
                <Text style={{ fontSize: fonts.xSmall, marginVertical: 10, marginLeft: 10 }}>
                    {toFormatedDateTime(props.post._source.tradingpostCreatedAt)}
                </Text>}

        </View>
    </View>

}
