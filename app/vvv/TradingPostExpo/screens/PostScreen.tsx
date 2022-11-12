import React, { useEffect, useState } from "react";
import { View } from "react-native";
//import { DashProps } from "../layouts/DashboardLayout";
import { flex } from "../style";
import { CommentIcon } from "../images";
import { Input } from "@ui-kitten/components";
import { PostView } from "../components/PostView";
import { Api, Interface } from "@tradingpost/common/api";
import { TabScreenProps } from "../navigation";
import { CommentsList } from "../components/CommentList";
import { KeyboardAvoidingInput } from "../components/KeyboardAvoidingInput";
import { AwaitedReturn } from "../utils/misc";

export function PostScreen(props: TabScreenProps<{ post: Interface.IElasticPostExt }>) {
    const [postCommments, setPostComments]  = useState<AwaitedReturn<typeof Api.Comment.extensions.postList>>([]);
    const [newComment, setNewComment] = useState('');
    const [commentAdded, setCommentAdded] = useState(0);
    useEffect(() => {
        Api.Comment.extensions.postList({type: "post", id: props.route.params.post._source.id})
        .then((r) => {
            const data = r.sort((a, b) => {
                const diff = (new Date(String(a.created_at))).valueOf() - (new Date(String(b.created_at))).valueOf()
                return diff
            })
            setPostComments(data);
        })
    },[])
    useEffect(() => {
        Api.Comment.extensions.postList({type: "post", id: props.route.params.post._source.id})
        .then((r) => {
            const data = r.sort((a, b) => {
                const diff = (new Date(String(a.created_at))).valueOf() - (new Date(String(b.created_at))).valueOf()
                return diff
            })
            setPostComments(data);
        })
    },[commentAdded])

    return (<View style={{height: "100%"}}>
                <PostView
                    post={props.route.params.post}/>
                <CommentsList
                    comments={postCommments ? postCommments : []} />
               <KeyboardAvoidingInput 
                    value={newComment} 
                    placeholder={'Leave your comment'}
                    rightIcon={(props: any) => <CommentIcon height={24} 
                    width={24}
                    style={{ height: 24, width: 24, alignContent: 'center'}}/>}
                    setValue={setNewComment} 
                    displayButton={true}
                    numLines={1}
                    item_id={props.route.params.post._source.id}
                    clicked={[commentAdded, setCommentAdded]}
                    onClick={(r: any, s: any, t: any) => {
                        Api.Comment.insert({user_id: props.route.params.post._source.user.id ,related_type: 'post', comment: r, related_id: t })
                        s('')
                    }}
                    />
            </View> )
        
}