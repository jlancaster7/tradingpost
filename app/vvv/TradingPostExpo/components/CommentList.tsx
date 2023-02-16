import { Interface } from "@tradingpost/common/api";
import { useState } from "react";
import { Text } from 'react-native'
import { DataOrQuery, List } from "./List";
import { fonts, sizes } from "../style";
import { CommentView, CommentViewV2 } from "./CommentView";
import { Section } from "./Section";
import React from "react";

export function CommentsList(props: { comments: Interface.ICommentPlus[] }) {

    return (
        <Section title="Comments" style={{ flex: 1, backgroundColor: 'transparent', marginHorizontal: sizes.rem1 }}>
            <List
                getItemLayout={(items, index, sizeCache) => {
                    const curItem = items?.[index];
                    const length = 20;
                    const output = typeof curItem === "object" ?
                        (sizeCache[index] ?
                            sizeCache[index] :
                            {
                                index,
                                offset: length * index,
                                length: length
                            }) :
                        {
                            index,
                            offset: sizeCache[index - 1].offset + sizeCache[index - 1].length,
                            length: 40
                        };
                    return output;
                }}
                key={"id" + String(props.comments.length)}
                datasetKey={"___"}
                data={props.comments}
                keyExtractor={(item, index) => typeof item === "string" ? "loadingtext" : (index + "_" + item.id)}
                preloadOffset={2}
                renderItem={(item) => {

                    if (typeof item.item === "string") {
                        return <Text style={{ textAlign: "center", fontSize: fonts.large }}>Loading More...</Text>
                    }
                    else {
                        return <CommentView key={item.index + "_" + item.item.id} comment={item.item} />
                    }
                }}
                noDataMessage={"No Comments Available"}
                loadingItem={"  "}
            />
        </Section>)
}


//Will expand and swap this out later. This should probably be designed more generically and paginated  
export function CommentsListv2(props: { comments: Interface.ICommentBasic[] | undefined }) {

    return (
        <Section title="Comments" style={{ flex: 1, backgroundColor: 'transparent', marginHorizontal: sizes.rem1 }}>
            <List
                getItemLayout={(items, index, sizeCache) => {
                    const curItem = items?.[index];
                    const length = 20;
                    const output = typeof curItem === "object" ?
                        (sizeCache[index] ?
                            sizeCache[index] :
                            {
                                index,
                                offset: length * index,
                                length: length
                            }) :
                        {
                            index,
                            offset: sizeCache[index - 1].offset + sizeCache[index - 1].length,
                            length: 40
                        };
                    return output;
                }}
                key={String(props.comments?.[0]?.created_at) || "empty"}
                datasetKey={"___"}
                data={props.comments}
                keyExtractor={(item, index) => typeof item === "string" ? "loadingtext" : (index + "_" + item.user_id)}
                preloadOffset={2}
                renderItem={(item) => {

                    if (typeof item.item === "string") {
                        return <Text style={{ textAlign: "center", fontSize: fonts.large }}>Loading More...</Text>
                    }
                    else {
                        return <CommentViewV2 key={item.index + "_" + item.item.id} comment={item.item} />
                    }
                }}
                noDataMessage={"No Comments Available"}
                loadingItem={"  "}
            />
        </Section>)
}