import { Interface } from "@tradingpost/common/api";
import { IElasticPost } from "@tradingpost/common/api/entities/interfaces";
import React, { useRef, useState } from "react";
import { ScrollView, Text } from "react-native";

//import { Bookmark, getPosts } from "../apis/PostApi";
//import { FeedType, IPost, IPostWithHtmlAndBk } from "../interfaces/IPost";
import { fonts } from "../style";
//import { toAmiraDate, fromAmiraDate } from "../utils/misc";
import { DataOrQuery, List } from "./List";
import { PostView } from "./PostView";



export function PostList(props: { posts?: DataOrQuery<Interface.IElasticPostExt>, datasetKey?: string }) {

    return <List

        getItemLayout={(items, index, sizeCache) => {
            const curItem = items?.[index];
            const output = typeof curItem === "object" ? sizeCache[index]
                //|| (sizeCache[index] = {
                //     index,
                //     offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                //     length: (() => {
                //         const size = (items?.[index] as IElasticPost | undefined)?._source.size
                //         if (size) {
                //             return size.maxWidthPx / size.aspectRatio;
                //             //return size
                //         }
                //         else {
                //             return 20;
                //         }
                //     })()
                //}) 
                :
                { index, offset: sizeCache[index - 1].offset + sizeCache[index - 1].length, length: 40 };

            return output;

        }}
        data={props.posts}
        keyExtractor={(item, index) => typeof item === "string" ? "loadingtext" : (index + "_" + item._id)}
        preloadOffset={2}
        datasetKey={props.datasetKey}
        renderItem={(item) => {
            if (typeof item.item === "string") {
                return <Text style={{ textAlign: "center", fontSize: fonts.large }}>Loading More...</Text>
            }
            else {
                return <PostView key={item.index + "_" + item.item._id} post={item.item} />
            }
        }}
        noDataMessage={"No Posts Available"}
        loadingItem={"COOL"}
    />
}


//Keeping this commented to emphasise how ridiculous it was lol!!!!!!!!!!!
// export function usePostLoader(pageSize: number, bookmarks: Bookmark[] | undefined, isBookMarked?: boolean, creatorId?: string, errorHandler?: (message: string) => void) {
//     const feedTypeRef = useRef<{
//         response: FeedType,
//         subscriber_min_time?: number
//         disco_min_time?: number,
//         creator_min_time?: number
//     }>({
//         response: creatorId ? "creator" : "subscriber"
//     })
//     console.log("FEED TYPE BASE:" + feedTypeRef.current.response);

//     return bookmarks ? async (existingData: IPostWithHtmlAndBk[] | undefined, currentPage: number) => {
//         const output: IPostWithHtmlAndBk[] = [];

//         try {
//             if (existingData)
//                 output.push(...existingData);
//             let newPosts: IPostWithHtmlAndBk[] = [];

//             const bod: FeedRequestBody = {
//                 feed_type: feedTypeRef.current.response,
//                 //discovery_feed_last_loaded_post_id: existingData?.length ? existingData[existingData.length - 1]?.id : undefined
//                 creator_id: creatorId,
//                 subscriber_feed_last_loaded_date: feedTypeRef.current.subscriber_min_time ? toAmiraDate(new Date(feedTypeRef.current.subscriber_min_time)) : undefined,
//                 discovery_feed_last_loaded_date: feedTypeRef.current.disco_min_time ? toAmiraDate(new Date(feedTypeRef.current.disco_min_time)) : undefined,
//                 creator_feed_last_loaded_date: feedTypeRef.current.creator_min_time ? toAmiraDate(new Date(feedTypeRef.current.creator_min_time)) : undefined
//             };

//             if (!isBookMarked) {
//                 const resp = (await getFeed(String(pageSize), bod));

//                 let curLastMin: number | undefined;
//                 let output: number[] = [];

//                 resp.posts.forEach((p) => {
//                     const val = fromAmiraDate(p.created_at as string).valueOf();
//                     output.push(val)
//                     if (!curLastMin) {
//                         curLastMin = val;
//                     }
//                     else {
//                         curLastMin = Math.min(val, curLastMin);
//                     }
//                 });

//                 feedTypeRef.current.response = resp.feed_type;

//                 if (feedTypeRef.current.response === "subscriber")
//                     feedTypeRef.current.subscriber_min_time = curLastMin;
//                 else if (feedTypeRef.current.response === "discovery")
//                     feedTypeRef.current.disco_min_time = curLastMin;
//                 else if (feedTypeRef.current.response === "creator") {
//                     feedTypeRef.current.creator_min_time = curLastMin;
//                 }
//                 console.log("FEED TYPE:" + JSON.stringify(feedTypeRef.current));
//                 newPosts = resp.posts;
//             }
//             else if (currentPage === 0)
//                 newPosts = await getPosts(bookmarks.map((b) => b.post_id) || []);

//             // newPosts.forEach((p) => {
//             //     p.bookmarkId = bookmarks.find(b => b.post_id === p.id)?.id;
//             // });

//             if (newPosts.length)
//                 console.log(`${newPosts[0].id}->${newPosts[newPosts.length - 1].id}`);

//             output.push(...newPosts);
//         } catch (ex) {
//             if (errorHandler) {
//                 errorHandler("Something went wrong.")
//             }
//         }
//         return output;


//     } : undefined
// }