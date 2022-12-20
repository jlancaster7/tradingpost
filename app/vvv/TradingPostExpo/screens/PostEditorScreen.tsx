import { Api } from "@tradingpost/common/api";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { useToast } from "react-native-toast-notifications";
import { Header } from "../components/Headers";
import { Label } from "../components/Label";
import { ButtonPanel } from "../components/ScrollWithButtons";
import { TextEditor } from "../components/TextEditor";
import { TextField } from "../components/TextField";
import { Text } from "@ui-kitten/components";
import { ButtonGroup } from "../components/ButtonGroup";
//import Navigation, {DashScreenProps, TabScreenProps} from "../navigation";
import { sizes, flex, fonts } from "../style";
import { bindTextInput, bindTextInputBase, useReadonlyEntity } from "../utils/hooks";

export const PostEditorScreen = (props: any) => {
    const [subLevel, setSubLevel] = useState('standard')
    const postEntity = useReadonlyEntity({
        content: "",
        title: "",
        subscription_level: "standard",
        height: 0,
        width: 0,
        photos: []
    }),
        [locked, setLocked] = useState(false),
        editorRef = useRef<any>(null),
        toast = useToast(),
        [contentFocused, setContentFocused] = useState(false)

    return <View style={{ backgroundColor: "white", flexGrow: 1 }}>
        <Header text='+ New Post' style={{ marginBottom: 0, marginTop: 4, marginLeft: sizes.rem1, color: "black" }} />
        <View style={{ width: '90%' }}>
            <ButtonGroup
                style={{ margin: sizes.rem1 }}
                unselectedStyle={{
                    backgroundColor: "#35A265",
                }}
                value={subLevel}
                onValueChange={(value) => {
                    setSubLevel(value);
                    postEntity.update({ subscription_level: value })

                }}
                items={[{ label: "Free", value: "standard" }, { label: "Premium", value: "premium" }]} />
        </View>
        <View style={{ marginHorizontal: sizes.rem1, marginTop: sizes.rem1 }}>
            <TextField
                label='Post Title' placeholder='Add a title to your post'  {...bindTextInput(postEntity, "title", null)}
                markRequired />
        </View>
        <View style={{ flex: 1, marginHorizontal: sizes.rem1 / 5 }}>
            <ScrollView
                onTouchEnd={(ev) => {
                    if (!contentFocused) {
                        editorRef.current?.focusContentEditor();
                    }
                }}
                style={[flex, {}]}
                contentContainerStyle={{ minHeight: "100%", maxHeight: "100%", height: "100%" }}>
                <Text style={{ fontSize: fonts.medium, marginHorizontal: sizes.rem1, marginVertical: sizes.rem1 }}>Post</Text>
                {Platform.OS === 'web'} <TextEditor html={postEntity.data.content} onChangeHtml={function (text: string): void {
                    postEntity.update({
                        "content": text
                    })
                }} />
                {Platform.OS !== 'web' && <RichEditor
                    onLayout={(event) => {
                        postEntity.update({ height: event.nativeEvent.layout.width / event.nativeEvent.layout.height, width: event.nativeEvent.layout.width })
                    }}
                    onFocus={() => {
                        setContentFocused(true)
                    }} onBlur={() =>
                        setContentFocused(false)} containerStyle={{ minHeight: 1 }}
                    initialContentHTML={postEntity.data.content} ref={editorRef}
                    placeholder={"Add content to your post"}
                    {...bindTextInputBase(postEntity, "content", null, { "onChangeTextKey": "onChange" })} />}
            </ScrollView>
        </View>

        {/* //TODO: add are you sure if dirty  */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            {Platform.OS !== "web" && <RichToolbar editor={editorRef} />}
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


                        setLocked(true);
                        if (!postEntity.data.content || !postEntity.data.title) {
                            toast.show("Please provide a title and content for your post");
                            setLocked(false);
                        } else {
                            try {
                                //const { id: postId } = 
                                await Api.Post.extensions.create(postEntity.data);
                                // Navigation.pop(props.componentId);
                                // const posts = await getPosts([postId]);
                                // screens.push(props.componentId, "Post",
                                //     { passProps: { post: posts[0] } });
                                props.navigation.goBack();

                            } catch (ex: any) {
                                toast.show(ex.message);
                                setLocked(false);
                            }
                        }
                    }
                    ,
                    "text": "Create"
                }}
            />
        </KeyboardAvoidingView>

    </View>
}