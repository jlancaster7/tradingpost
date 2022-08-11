import React, { useEffect, useState } from 'react'
import { Alert, Image, ImageBackground, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button, Icon } from '@ui-kitten/components'

import { flex, fonts, row, shadow, sizes } from '../style'
import UserLogo from '@iconify/icons-mdi/user'
import { IconifyIcon } from './IconfiyIcon'
import { Header, Subheader } from './Headers'
import { PrimaryChip } from './PrimaryChip'
import { BookmarkActive, BookmarkIcons, CommentIcon, navIcons, postBg, social, UpvoteIcon } from '../images'
import { social as socialStyle } from '../style'
import { IconButton } from './IconButton'
//import { IPostList } from '../api/entities/interfaces'
import { LogoImage } from './LogoImage'
//import { ensureCurrentUser } from '../apis/Authentication'
//import { WebView } from 'react-native-webview';
import { color } from 'react-native-reanimated'
//import { screens } from '../navigationComponents'
//import { fullDashOptions } from '../layouts/DashboardLayout'
import { AsyncPressable } from './AsyncPressable'
import { AppColors } from '../constants/Colors'
import { Api, Interface } from '@tradingpost/common/api'
import { HtmlView } from './HtmlView'
import { useWindowDimensions } from 'react-native'
import { ProfileButton } from './ProfileButton'
import { useToast } from 'react-native-toast-notifications'
//import { setBookmarked } from '../apis/PostApi'
//import { openProfileScreen } from '../screens/ProfileScreen'


const postTotalVerticalMargin = sizes.rem1;
const postTotalHorizontalMargin = sizes.rem2;
const postSidePad = sizes.rem2;
const postTotalBorder = 2//4;
export const spaceOnSide = postTotalHorizontalMargin + postTotalBorder + postSidePad
//const profileStyle = { marginLeft: 0, height: 56, width: 56, borderRadius: 28, marginRight: sizes.rem1 / 4 }



// const platformStyles: Partial<Record<PostPlatform, string>> = {
//     "tradingpost": `<style>body { margin: 0; padding:16; /*background-color:orange;*/ font-size:40 } div {/* background-color:green*/ }</style>`,
//     "youtube": `<style>body { margin: 0; padding:0; /*background-color:orange;*/  } div {/* background-color:green*/ }</style>`
// };
// const platformInects: Partial<Record<PostPlatform, string>> = {
//     "tradingpost": "setTimeout(()=>ReactNativeWebView.postMessage(document.documentElement.scrollHeight),[100])",
//     "twitter": `
//         function bodySized(){
//             ReactNativeWebView.postMessage(document.documentElement.scrollHeight);
//         }
//         const v = setInterval(
//                 ()=>{
//                     const val = document.querySelector('.twitter-tweet-rendered');
//                     if(val){
//                         clearInterval(v);
//                         twttr.ready(function (twttr) {
//                             // At this point the widget.js file had been loaded.
//                             // We can now make use of the twttr events
//                             twttr.events.bind('rendered', function (event) {
//                                  // At this point the tweet as been fully loaded
//                                  // and rendered and you we can proceed with our Javascript
//                                 //console.log("Created widget", event.target.id);
//                                 setTimeout(()=>
//                                 bodySized(),100)
//                             });
//                         });

//                     }
//                 },[100])

//         // var ro = new ResizeObserver(entries => {
//         //     bodySized();
//         // });


//         //ro.observe(document.body);
//     `
// };
// const platformAspectRatio: Partial<Record<PostPlatform, number>> = {
//     //"twitter": 0.4
//     "youtube": 1.77
// };
// const platformAutoHeight: Partial<Record<PostPlatform, number>> = {
//     "tradingpost": PixelRatio.get(),
//     "twitter": 1
// };

//export const EXTRA_HEIGHT = 54 + 8 * 2 + 1 + 20;
//+ 8 * 2 + 9 * 2 + 8 * 2;

export const postInnerHeight = (itm: Interface.IElasticPost | undefined, windowWidth: number) => {
    const size = (itm as Interface.IElasticPost | undefined)?._source.size
    if (itm?._source.postType === "substack") {
        return 200;
    }
    else if (size) {
        return windowWidth / size.aspectRatio + (itm?._source.postType === "tweet" ? 20 * windowWidth / itm._source.size.maxWidth : 0);
    }
    else if (itm?._source.postType === "youtube") {
        return windowWidth / (390 / 230);
    }
    else if (itm?._source.postType === "spotify") {
        return windowWidth / (360 / 162);
    }
    else {
        return 200;
    }
}
export const resolvePostContent = (itm: Interface.IElasticPost | undefined, windowWidth: number) => {
    switch (itm?._source.postType) {
        case "youtube":
            return itm._source.postUrl.replace("https://www.youtube.com/watch?v=", "//www.youtube.com/embed/");
        case 'tweet':
            return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"></meta></head><body style="margin:0; padding:0;width:${itm._source.size.maxWidth}px;transform: scale(${windowWidth / itm._source.size.maxWidth});transform-origin: top left;">
            ${itm._source.content.htmlBody}
            </body></html>`
        case 'spotify':
            const matches = /src="(.*)"/.exec(itm._source.content.body);
            return matches?.[1] || "";
        default:
            return itm?._source.content.htmlBody || "";
    }
}
export function PostView(props: { post: Interface.IElasticPostExt }) {
    const { post } = props


    //const cu = null,// ensureCurrentUser(),

    const [isBookmarked, setIsBookmarked] = useState(Boolean(post.ext.is_bookmarked));
    const [isUpvoted, setIsUpvoted] = useState(Boolean(post.ext.is_upvoted));

    //[preloadVars, setPreloadVars] = useState<{ $_width: number } | undefined>(undefined),
    //needsLayout = false,// props.post.platform === "twitter";
    //preloadJS = preloadVars ? Object.keys(preloadVars).map(k => `const ${k}=${preloadVars[k as keyof typeof preloadVars]}`).join(";\r\n") : undefined,
    //[webViewHeight, setWebViewHeight] = useState<number>();

    // useEffect(() => {
    //     if (props.post.platform === "twitter") {
    //         console.log(props.post.html);
    //     }

    // }, [])

    //    console.log(props.post.html);
    //    const { type: postType } = props.post;
    const [showStatus, setShowStatus] = useState(false);
    return <View style={{ marginHorizontal: postTotalHorizontalMargin / 2, marginVertical: postTotalVerticalMargin / 2 }} >
        <View
            style={[shadow, { backgroundColor: "white", borderRadius: sizes.borderRadius * 4, borderColor: "#ccc", borderWidth: postTotalBorder / 2 }]}>
            <Pressable
                onPress={() => {
                    //openProfileScreen(props.parentComponentId, props.post.creator.id_creator);
                }} style={[row, { alignItems: "center", overflow: "hidden", borderBottomColor: "#ccc", borderBottomWidth: 1, padding: sizes.rem1 / 2 }]}>
                {
                    <ProfileButton userId={props.post._source.user.id} profileUrl={props.post.ext.user?.profile_url || ""} size={56} />
                }
                <View style={[flex, { marginLeft: sizes.rem0_5 }]}>
                    <Subheader text={"@" + (props.post.ext.user?.handle || "NoUserAttached")} style={{ color: "black", fontWeight: "bold" }} />
                    <View>
                        <ScrollView nestedScrollEnabled horizontal>
                            <View style={row}>
                                {(props.post.ext.user?.tags || ["No", "Tags", "Here"]).map((chip, i) =>
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
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }}>
                    {!isBookmarked && <IconButton iconSource={BookmarkIcons.inactive} style={{ height: 24, width: 24, marginLeft: "auto", }} />}
                    {isBookmarked && <BookmarkActive style={{ height: 16, width: 16, marginLeft: "auto", marginRight: sizes.rem0_5 / 2 }} />}
                </AsyncPressable>
            </Pressable>
            <View style={{ paddingHorizontal: postSidePad / 2 }}>
                <PostContentView post={post} />
            </View>
            {/* {props.post.html ? <>
                    {props.post.title && <Subheader text={props.post.title || ""} style={{ color: "black", marginTop: sizes.rem1 / 2, marginLeft: sizes.rem1 / 2 }} />}
                    <WebView
                        style={{
                            aspectRatio: platformAspectRatio[props.post.platform as PostPlatform],
                            height: platformAutoHeight[props.post.platform as PostPlatform] ? webViewHeight : undefined,
                            //Causes a weird bug if this is set to 1...
                            //..see https://github.com/react-native-webview/react-native-webview/issues/811
                            opacity: Platform.OS === "android" ? 0.99 : undefined,
                            minHeight: 80

                        }}

                        // onLayout={(ev) => {
                        //     if (needsLayout) setPreloadVars({
                        //         $_width:
                        //             PixelRatio.getPixelSizeForLayoutSize(ev.nativeEvent.layout.width)
                        //     })
                        // }}
                        key={"webview"}
                        source={{ html: needsLayout && !preloadVars ? "" : ((platformStyles[props.post.platform as PostPlatform] || "") + props.post.html || "") }}
                        // injectedJavaScriptBeforeContentLoaded={preloadJS}

                        onMessage={(m: any) => {
                            console.log(props.post.platform + " Message:" + m.nativeEvent.data);
                            const val = platformAutoHeight[props.post.platform as PostPlatform];
                            if (val)
                                setWebViewHeight(Number(m.nativeEvent.data) / val);
                        }}
                        injectedJavaScript={platformInects[props.post.platform as PostPlatform]}
                    /></> : 
                    (
                    props.post.platform === "substack" ? <SubstackView post={props.post} /> :

                    
                        <Text>{props.post.content}</Text>
                )} */
            }
            {(props.post._source.postType !== "tweet") &&
                <View style={[row, { alignItems: "center", marginTop: "auto", borderTopColor: "#ccc", borderTopWidth: 1 }]}>
                    {showStatus && <View style={{ position: "absolute", backgroundColor: "black", opacity: 0.6, width: 100, margin: "auto", top: 12, left: 0, borderRadius: 8, right: 0, padding: 4 }}><Text style={{ width: "100%", textAlign: "center", color: "white" }}>Upvoted!</Text></View>}
                    <Button style={{ marginLeft: "auto", paddingHorizontal: 0 }} appearance={'ghost'} accessoryLeft={(props: any) => <CommentIcon height={24} width={24} style={{ height: 24, width: 24, }} />} >-</Button>
                    {<Button
                        style={{ paddingHorizontal: 0 }}
                        onPress={() => {
                            if (!isUpvoted)
                                setShowStatus(true);
                            Api.Post.extensions.setUpvoted({
                                id: post._id,
                                is_upvoted: !isUpvoted
                            }).then((r) => {
                                if (r.is_upvoted)
                                    setTimeout(() => {
                                        setShowStatus(false)
                                    }, 1333);
                                setIsUpvoted(r.is_upvoted);
                            });
                        }}
                        accessoryLeft={(props: any) => <UpvoteIcon height={24} width={24} style={{ height: 24, width: 24, opacity: isUpvoted ? 1 : 0.25 }} />} appearance={"ghost"} >{
                            isUpvoted ? "1" : "-"
                        }</Button>}
                    {/* <Button iconSource={(props: any) => <CommentIcon height={20} width={20} style={{ marginRight: sizes.rem1 / 2 }} />} label="Comment" color="black" backgroundColor={Colors.transparent} /> */}
                    {//postType === "platform" && <IconButton iconSource={navIcons.Feed.active} style={{ marginLeft: "auto" }} />
                    }
                    {//postType === "trade_alert" && <IconButton iconSource={navIcons.Notification.active} style={{ marginLeft: "auto", }} />
                    }
                </View>}
        </View>
    </View >
}


const SubstackView = (props: { post: Interface.IPostList }) => {
    const { post } = props;
    return <View style={{ margin: sizes.rem1 }}>
        <View key="profile" style={{ flexDirection: "row", marginBottom: sizes.rem1, }}>
            {/* <Image style={{ aspectRatio: 0.9, marginRight: sizes.rem1 / 2 }} source={{ uri: post.platform_profile_url }} /> */}
            <IconifyIcon style={{ width: 40, height: 40, marginTop: 2, marginRight: sizes.rem1 / 1.5 }} svgProps={{ style: { margin: "auto" } }} icon={social.SubstackLogo} currentColor={socialStyle.substackColor} />
            <View style={{}}>
                <Text style={{ fontSize: fonts.small, fontWeight: "bold", textAlignVertical: "center" }}>
                    {/* {post.creator.first_name} {post.creator.last_name} */}
                </Text>
                {/* <Text>{post.platform_display_name}</Text> */}
            </View>
        </View>
        {/* <Subheader text={post.title || ""} style={{ color: "black" }}></Subheader> */}
        {/* <Text key="content" style={{ fontSize: fonts.small }}>{post.content}</Text> */}
    </View>
}

const PostContentView = (props: { post: Interface.IElasticPost }) => {
    const { width: windowWidth, scale } = useWindowDimensions(),
        availWidth = windowWidth - spaceOnSide

    return <HtmlView style={{ height: postInnerHeight(props.post, availWidth) }}
        isUrl={props.post._source.postType === "youtube" || props.post._source.postType === "spotify"}
    >{resolvePostContent(props.post, availWidth)}
    </HtmlView>
}