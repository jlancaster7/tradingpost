import React from "react";
import { View } from "react-native";
//import { DashProps } from "../layouts/DashboardLayout";
import { flex } from "../style";

import { PostView } from "../components/PostView";
import { Interface } from "@tradingpost/common/api";
import { TabScreenProps } from "../navigation";

export function PostScreen(props: TabScreenProps<{ post: Interface.IElasticPostExt }>) {
    return <PostView
        post={props.route.params.post}
    //parentComponentId={props.componentId}
    />
}