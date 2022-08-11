import React from "react";
import { View } from "react-native";
//import { DashProps } from "../layouts/DashboardLayout";
import { flex } from "../style";
import { Text } from "react-native-ui-lib";
import { PostView } from "../components/PostView";
import { IPost, IPostWithHtmlAndBk } from "../interfaces/IPost";

export function PostScreen(props: { post: IPostWithHtmlAndBk }) {
    return <PostView
        post={props.post}
        //parentComponentId={props.componentId}
    />
}