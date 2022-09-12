import { NavigationProp } from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { View, Text } from "react-native";
import { PlusContentButton } from "../components/PlusContentButton";
import { PostList } from "../components/PostList";
import { spaceOnSide, postInnerHeight, PostView } from "../components/PostView";
import { TabScreenProps } from "../navigation";

export const FeedScreen = (props: TabScreenProps<{ bookmarkedOnly?: "true" | "false" }>) => {
    const [searchText, setSearchText] = useState("");

    //useEffect(()=>{
    //props.navigation.setOptions({
    //headerRight:
    //  })
    // return <Pressable onPress={() => {
    //     navigation.setParams({
    //       bookmarkedOnly: true
    //     })
    //   }}>
    //     <IconButton iconSource={BookmarkIcons.inactive} style={{ height: 24, width: 24 }} />
    //   </Pressable>
    //},[])

    return (
        <View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <FeedPart bookmarkedOnly={props.route.params.bookmarkedOnly === "true"} searchText={searchText} />
            <PlusContentButton onPress={() => {
                props.navigation.navigate("PostEditor")
            }} />
        </View>
    );
}


export const FeedPart = (props: {
    bookmarkedOnly?: boolean,
    searchText?: string,
    userId?: string
}) => {
    const { width: windowWidth } = useWindowDimensions();
    const { searchText, bookmarkedOnly, userId } = props
    return <PostList
        key={bookmarkedOnly ? String(Date.now()) : "STATIC"}
        datasetKey={searchText ? searchText : "____________"}
        posts={async (allItems, page, sizeCache) => {
            const posts = (await Api.Post.extensions.feed({
                page,
                bookmarkedOnly: bookmarkedOnly,
                userId,
                data: searchText ? {
                    terms: (() => {
                        const terms = searchText.split(" ");
                        if (terms.length === 1)
                            return terms[0]
                        else return terms.map(t => `(${t})`).join(" OR ")
                    })()
                } : undefined
            }));
            const newItems = [...(allItems || []), ...posts]
            newItems.forEach((itm, index) => {
                if (!sizeCache[index]) {
                    sizeCache[index] = {
                        index,
                        offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                        length: postInnerHeight(itm, windowWidth - spaceOnSide)
                    }
                }
            })
            return newItems;
        }}
    />
}