import React, { useEffect, useState } from 'react'
import { Alert, Image, ImageBackground, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { Button, Chip, Colors, TouchableOpacity, View } from 'react-native-ui-lib'
import { flex, fonts, row, sizes } from '../style'
import UserLogo from '@iconify/icons-mdi/user'
import { IconifyIcon } from './IconfiyIcon'
import { Header, Subheader } from './Headers'
import { PrimaryChip } from './PrimaryChip'
import { BookmarkActive, CommentIcon, navIcons, postBg, social, UpvoteIcon } from '../images'
import { social as socialStyle } from '../style'
import { IconButton } from './IconButton'
import { IPost, IPostWithHtmlAndBk, PostPlatform } from '../interfaces/IPost'
import { LogoImage } from './LogoImage'
import { ensureCurrentUser } from '../apis/Authentication'
import { WebView } from 'react-native-webview';
import { color } from 'react-native-reanimated'
import { screens } from '../navigationComponents'
import { fullDashOptions } from '../layouts/DashboardLayout'
import { AsyncPressable } from './AsyncPressable'
import { setBookmarked } from '../apis/PostApi'
import { openProfileScreen } from '../screens/ProfileScreen'


const profileStyle = { marginLeft: 0, height: 56, width: 56, borderRadius: 28, marginRight: sizes.rem1 / 4 }

const platformStyles: Partial<Record<PostPlatform, string>> = {
    "amira": `<style>body { margin: 0; padding:16; /*background-color:orange;*/ font-size:40 } div {/* background-color:green*/ }</style>`,
    "youtube": `<style>body { margin: 0; padding:0; /*background-color:orange;*/  } div {/* background-color:green*/ }</style>`
};
const platformInects: Partial<Record<PostPlatform, string>> = {
    "amira": "setTimeout(()=>ReactNativeWebView.postMessage(document.documentElement.scrollHeight),[100])",
    "twitter": `
        function bodySized(){
            ReactNativeWebView.postMessage(document.documentElement.scrollHeight);
        }
        const v = setInterval(
                ()=>{
                    const val = document.querySelector('.twitter-tweet-rendered');
                    if(val){
                        clearInterval(v);
                        twttr.ready(function (twttr) {
                            // At this point the widget.js file had been loaded.
                            // We can now make use of the twttr events
                            twttr.events.bind('rendered', function (event) {
                                 // At this point the tweet as been fully loaded
                                 // and rendered and you we can proceed with our Javascript
                                //console.log("Created widget", event.target.id);
                                setTimeout(()=>
                                bodySized(),100)
                            });
                        });
                        
                    }
                },[100])

        // var ro = new ResizeObserver(entries => {
        //     bodySized();
        // });
          
          
        //ro.observe(document.body);
    `
};
const platformAspectRatio: Partial<Record<PostPlatform, number>> = {
    //"twitter": 0.4
    "youtube":1.77
};
const platformAutoHeight: Partial<Record<PostPlatform, number>> = {
    "amira": PixelRatio.get(),
    "twitter": 1
};

export function PostView(props: { post: IPostWithHtmlAndBk, parentComponentId: string }) {

    const cu = ensureCurrentUser(),
        [isBookmarked, setIsBookmarked] = useState(Boolean(props.post.bookmark_id)),
        [preloadVars, setPreloadVars] = useState<{ $_width: number } | undefined>(undefined),
        needsLayout = false,// props.post.platform === "twitter";
        preloadJS = preloadVars ? Object.keys(preloadVars).map(k => `const ${k}=${preloadVars[k as keyof typeof preloadVars]}`).join(";\r\n") : undefined,
        [webViewHeight, setWebViewHeight] = useState<number>();

    // useEffect(() => {
    //     if (props.post.platform === "twitter") {
    //         console.log(props.post.html);
    //     }

    // }, [])

    //    console.log(props.post.html);
    //    const { type: postType } = props.post;

    return <View style={{ margin: sizes.rem1 / 2 }}>
        {
            /* <Pressable onPress={() => {
                if (props.parentComponentId)
                    screens.push(props.parentComponentId, "Post", {
                        options: fullDashOptions,
                        passProps: {
                            post: props.post
                        }
                    })
            }}> */
        }
        <ImageBackground source={postBg} resizeMode="stretch" style={{ padding: sizes.rem1 / 2 }}
            imageStyle={{ borderRadius: sizes.borderRadius }}>
            <View style={{ backgroundColor: "white", borderRadius: sizes.borderRadius * 1.5 }}>
                <Pressable
                    onPress={() => {
                        openProfileScreen(props.parentComponentId, props.post.creator.id_creator);
                    }} style={[row, { alignItems: "center", overflow: "hidden", borderBottomColor: Colors.lightBlue, borderBottomWidth: 1, padding: sizes.rem1 / 2 }]}>
                    {
/*postType === "platform" || postType === "trade_alert" ?*/ <Image style={profileStyle} source={{ uri: props.post.creator.picture_url }} />
                        //:
                        // <LogoImage style={profileStyle} noBg />
                    }
                    <View style={flex}>
                        <Subheader text={props.post.creator.first_name + " " + props.post.creator.last_name} style={{ color: "black" }} />
                        <View>
                            <ScrollView nestedScrollEnabled horizontal>
                                <View style={row}>
                                    {props.post.creator.chip_labels?.map((chip, i) =>
                                        <PrimaryChip key={i} label={chip} />)}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                    <AsyncPressable onPress={async () => {
                        try {
                            // console.log(props.post.bookmarkId + '' + props.post.is_bookmarked)
                            await setBookmarked(props.post);
                            setIsBookmarked(Boolean(props.post.bookmark_id));
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }}>
                        {!isBookmarked && <IconButton iconSource={navIcons.Bookmark.inactive} style={{ marginLeft: "auto", }} />}
                        {isBookmarked && <BookmarkActive height={24} width={24} style={{ height: 24, marginLeft: "auto", }} />}
                    </AsyncPressable>
                </Pressable>
                {props.post.html ? <>
                    {props.post.title && <Subheader text={props.post.title || ""} style={{ color: "black", marginTop: sizes.rem1 / 2, marginLeft: sizes.rem1 / 2 }} />}
                    <WebView
                        style={{
                            aspectRatio: platformAspectRatio[props.post.platform],
                            height: platformAutoHeight[props.post.platform] ? webViewHeight : undefined,
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
                        source={{ html: needsLayout && !preloadVars ? "" : ((platformStyles[props.post.platform] || "") + props.post.html || "") }}
                        // injectedJavaScriptBeforeContentLoaded={preloadJS}

                        onMessage={(m) => {
                            console.log(props.post.platform + " Message:" + m.nativeEvent.data);
                            const val = platformAutoHeight[props.post.platform];
                            if (val)
                                setWebViewHeight(Number(m.nativeEvent.data) / val);
                        }}
                        injectedJavaScript={platformInects[props.post.platform]}
                    /></> : (
                    props.post.platform === "substack" ? <SubstackView post={props.post} /> :
                        <Text>{props.post.content}</Text>
                )}
                {(props.post.platform === "amira" || props.post.platform === "brokerage") &&
                    <View style={[row, { alignItems: "center", marginTop: "auto", borderTopColor: Colors.lightBlue, borderTopWidth: 1 }]}>
                        <Button style={{/*minWidth:0, width:106*/ }} iconSource={(props: any) => <UpvoteIcon height={24} width={24} style={{ marginRight: sizes.rem1 / 2 }} />} label="Upvote" color="black" backgroundColor={Colors.transparent} />
                        <Button iconSource={(props: any) => <CommentIcon height={20} width={20} style={{ marginRight: sizes.rem1 / 2 }} />} label="Comment" color="black" backgroundColor={Colors.transparent} />
                        {//postType === "platform" && <IconButton iconSource={navIcons.Feed.active} style={{ marginLeft: "auto" }} />
                        }
                        {//postType === "trade_alert" && <IconButton iconSource={navIcons.Notification.active} style={{ marginLeft: "auto", }} />
                        }
                    </View>
                }
            </View>
        </ImageBackground >
        {/* </Pressable> */}
    </View >
}


const SubstackView = (props: { post: IPost }) => {
    const { post } = props;
    return <View style={{ margin: sizes.rem1 }}>
        <View key="profile" style={{ flexDirection: "row", marginBottom: sizes.rem1, }}>
            {/* <Image style={{ aspectRatio: 0.9, marginRight: sizes.rem1 / 2 }} source={{ uri: post.platform_profile_url }} /> */}
            <IconifyIcon style={{ width: 40, height: 40, marginTop: 2, marginRight: sizes.rem1 / 1.5 }} svgProps={{ style: { margin: "auto" } }} icon={social.SubstackLogo} currentColor={socialStyle.substackColor} />
            <View style={{}}>
                <Text style={{ fontSize: fonts.small, fontWeight: "bold", textAlignVertical: "center" }}>{post.creator.first_name} {post.creator.last_name}</Text>
                <Text>{post.platform_display_name}</Text>
            </View>
        </View>
        <Subheader text={post.title || ""} style={{ color: "black" }}></Subheader>
        <Text key="content" style={{ fontSize: fonts.small }}>{post.content}</Text>
    </View>
}