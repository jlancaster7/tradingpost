import React, { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
//import { DashProps } from "../layouts/DashboardLayout";
import { flex } from "../style";
import { CommentIcon, SendIcon } from "../images";
import { Input } from "@ui-kitten/components";
import { PostView } from "../components/PostView";
import { Api, Interface } from "@tradingpost/common/api";
import { CommentsList } from "../components/CommentList";
import { KeyboardAvoidingInput } from "../components/KeyboardAvoidingInput";
import { AwaitedReturn } from "../utils/misc";
import { RootStackScreenProps } from "../navigation/pages";

export function PostScreen(props: RootStackScreenProps<"PostScreen">) {
    //https://m.tradingpostapp.com/post?


    const [post, setPost] = useState(props.route.params.post);

    useEffect(() => {
        if (!post) {
            //lookup posts 
            Api.Post.extensions.feed({
                page: 0,
                postId: props.route.params.id
            }).then((r) => {
                setPost(r[0]);
            }).catch(ex => {
                console.error(ex);
            })

        }
    }, [props.route.params.id, post])


    const [postCommments, setPostComments] = useState<AwaitedReturn<typeof Api.Comment.extensions.postList>>([]);
    const [newComment, setNewComment] = useState('');
    const [commentAdded, setCommentAdded] = useState(0);
    useEffect(() => {
        if (post) {
            Api.Comment.extensions.postList({ type: "post", id: post._source.id })
                .then((r) => {
                    const data = r.sort((a, b) => {
                        const diff = (new Date(String(a.created_at))).valueOf() - (new Date(String(b.created_at))).valueOf()
                        return diff
                    })
                    setPostComments(data);
                })
        }
    }, [post])
    useEffect(() => {
        if (post)
            Api.Comment.extensions.postList({ type: "post", id: post._source.id })
                .then((r) => {
                    const data = r.sort((a, b) => {
                        const diff = (new Date(String(a.created_at))).valueOf() - (new Date(String(b.created_at))).valueOf()
                        return diff
                    })
                    setPostComments(data);
                })
    }, [commentAdded, post])

    return (<View style={{ height: "100%" }}>
        {post && <PostView
            post={post} />}
        <CommentsList
            comments={postCommments ? postCommments : []} />
        <KeyboardAvoidingInput
            value={newComment}
            placeholder={'Leave your comment'}
            rightIcon={(props: any) => <SendIcon height={24}
                width={24}
                style={{ height: 24, width: 24, alignContent: 'center' }}
            />
            }
            setValue={setNewComment}
            displayButton={true}
            numLines={1}
            item_id={post?._source.id}
            clicked={[commentAdded, setCommentAdded]}
            onClick={(r: any, s: any, t: any) => {

                if (r.length && post)
                    Api.Comment.insert({ user_id: post._source.user.id, related_type: 'post', comment: r, related_id: t })
                Keyboard.dismiss()
                s('')
            }}
        />
    </View>)

}