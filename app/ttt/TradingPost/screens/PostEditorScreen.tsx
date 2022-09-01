import React, { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Header } from "../components/Headers";
import { Label } from "../components/Label";
import { ButtonPanel } from "../components/ScrollWithButtons";
import { TextEditor, TextEditorToolbar } from "../components/TextEditor";
import { TextField } from "../components/TextField";
import Navigation, { DashScreenProps, TabScreenProps } from "../navigation";
import { sizes, flex } from "../style";
import { bindTextInput, bindTextInputBase, useReadonlyEntity } from "../utils/hooks";

export const PostEditorScreen = (props: TabScreenProps) => {


    const postEntity = useReadonlyEntity({
        content: "",
        title: "",
        platform: "tradingpost",
        subscription_level: "standard",
        photos: []
    }),
        [locked, setLocked] = useState(false),
        editorRef = useRef<any>()
    //[contentFocused, setContentFocused] = useState(false)

    return <View style={{ backgroundColor: "white", flexGrow: 1 }}>
        <Header text='+ New Post' style={{ marginBottom: 0, marginTop: 4, marginLeft: sizes.rem1, color: "black" }} />
        <View style={{ marginHorizontal: sizes.rem1, marginTop: sizes.rem1 }}>
            <TextField
                label='Post Title' placeholder='Add a title to your post'  {...bindTextInput(postEntity, "title", null)} markRequired />
            <Label>Content</Label>
        </View>
        <View style={{ flex: 1, marginHorizontal: sizes.rem1 / 5 }}>
            <ScrollView onTouchEnd={(ev) => {
                //if (!contentFocused) {

                //editorRef.current?.focusContentEditor();
                //}

            }} style={[flex, {}]}
                contentContainerStyle={{ minHeight: "100%" }} >
                <TextEditor editorRef={editorRef} />

                {/* <RichEditor onFocus={() => {
                    setContentFocused(true)
                }} onBlur={() => setContentFocused(false)} containerStyle={{ minHeight: 1 }} initialContentHTML={postEntity.data.content} ref={editorRef} placeholder={"Add content to your post"}
                    {...bindTextInputBase(postEntity, "content", null, { "onChangeTextKey": "onChange" })} /> */}
            </ScrollView>
        </View>
        {/* //TODO: add are you sure if dirty  */}
        <ButtonPanel
            locked={locked}
            left={{
                onPress: () => {
                    props.navigation.goBack();
                },
                "text": "Cancel"
            }}
            right={{
                onPress: async () => {
                    // setLocked(true);
                    // if (!postEntity.data.content || !postEntity.data.title) {
                    //     dashref.current?.toastMessage("Please provide a title and content for your post");
                    //     setLocked(false);
                    // }
                    // else {
                    //     try {
                    //         const { id: postId } = await createPost(null, postEntity.data);
                    //         Navigation.pop(props.componentId);

                    //         const posts = await getPosts([postId]);
                    //         screens.push(props.componentId, "Post",
                    //             { passProps: { post: posts[0] } });

                    //     }
                    //     catch (ex: any) {
                    //         dashref.current?.toastMessage(ex.message);
                    //         setLocked(false);
                    //     }
                    // }

                },
                "text": "Create"
            }}
        />
        <TextEditorToolbar editorRef={editorRef} />
    </View>
}