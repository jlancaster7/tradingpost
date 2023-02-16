import { Interface } from "@tradingpost/common/api";
import React from "react";
import { Text } from "react-native";
import { fonts } from "../style";
import { DataOrQuery, List } from "./List";
import { PostView } from "./PostView";

export function PostList(props: { posts?: DataOrQuery<Interface.IElasticPostExt>, datasetKey?: string, onRefresh?: () => void, onReloadNeeded?: () => void }) {
    return <List
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