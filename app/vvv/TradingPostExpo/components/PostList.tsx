import { Interface } from "@tradingpost/common/api";
import React from "react";
import { FlatListProps, Text } from "react-native";
import { fonts } from "../style";
import { AnimatedList, DataOrQuery, HasU, List, ListProps } from "./List";
import { PostView } from "./PostView";

export type PostListOnScroll = FlatListProps<HasU<Interface.IElasticPostExt, string>>["onScroll"]
export type ContentStyle = FlatListProps<HasU<Interface.IElasticPostExt, string>>["contentContainerStyle"]
export type PostScrollEnd = FlatListProps<HasU<Interface.IElasticPostExt, string>>["onMomentumScrollEnd"]
export type PostScrollBegin = FlatListProps<HasU<Interface.IElasticPostExt, string>>["onMomentumScrollBegin"]
export type PostScrollDragBegin = FlatListProps<HasU<Interface.IElasticPostExt, string>>["onScrollBeginDrag"]
export type PostScrollAnimEnd = FlatListProps<HasU<Interface.IElasticPostExt, string>>["onScrollAnimationEnd"]
export function PostList(props: { posts?: DataOrQuery<Interface.IElasticPostExt>, datasetKey?: string, onRefresh?: () => void, onReloadNeeded?: () => void, onScroll?: PostListOnScroll, contentContainerStyle?: ContentStyle, onMomentumScrollEnd?: PostScrollEnd, onMomentumScrollBegin?: PostScrollBegin, onScrollBeginDrag?: PostScrollDragBegin, onScrollAnimationEnd?: PostScrollAnimEnd }) {
    return <AnimatedList
        contentContainerStyle={props.contentContainerStyle}
        onMomentumScrollEnd={props.onMomentumScrollEnd}
        onMomentumScrollBegin={props.onMomentumScrollBegin}
        onScrollBeginDrag={props.onScrollBeginDrag}
        onScroll={props.onScroll}
        onRefresh={props.onRefresh}

        listKey={props.datasetKey || 'STATIC'}
        getItemLayout={(items, index, sizeCache) => {
            const curItem = items?.[index];
            const output = typeof curItem === "object" ? sizeCache[index] : {
                index,
                offset: sizeCache[index - 1].offset + sizeCache[index - 1].length,
                length: 40
            };
            return output;
        }}
        data={props.posts}
        keyExtractor={(item, index) => typeof item === "string" ? "loadingtext" : (index + "_" + item._id)}
        preloadOffset={2}
        datasetKey={props.datasetKey}
        renderItem={(item) => {
            if (typeof item.item === "string") {
                return <Text style={{ textAlign: "center", fontSize: fonts.large }}>Loading More...</Text>
            } else {
                return <PostView key={item.index + "_" + item.item._id} post={item.item} onReloadNeeded={props.onReloadNeeded} />
            }
        }}
        noDataMessage={"No Posts Available"}
        loadingItem={"  "}
    />
}