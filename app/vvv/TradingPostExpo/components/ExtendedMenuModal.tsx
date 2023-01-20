import { Modal, Card, Button, Icon } from "@ui-kitten/components"
import { Share, ScrollView, Pressable, StyleSheet, Text } from "react-native"
import { useToast } from "react-native-toast-notifications"
import toast from "react-native-toast-notifications/lib/typescript/toast"
import { Header } from "./Headers"
import { ElevatedSection } from "./Section"
import { Api } from '@tradingpost/common/api'
import { useState } from "react"
import { Picker } from "./Picker"
import { PrimaryButton } from "./PrimaryButton"
import { SecondaryButton } from "./SecondaryButton"
import { KeyboardAvoidingInput } from "./KeyboardAvoidingInput"


const styles = StyleSheet.create({
    container: {
        minHeight: 192,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});


const HardcodedReportingReasons = [
    {
        text: "I just dont like it",
        value: "I just dont like it"
    },
    {
        text: "It's spam",
        value: "It's spam"
    },
    {
        text: "Nudity or sexual activity",
        value: "Nudity or sexual activity"
    },
    {
        text: "Hate speech or symbols",
        value: "Hate speech or symbols"
    },
    {
        text: "Bullying or harassment",
        value: "Bullying or harassment"
    },
    {
        text: "False information",
        value: "False information"
    },
    {
        text: "Violence or dangerous organizations",
        value: "Violence or dangerous organizations"
    },
    {
        text: "Scam or fraud",
        value: "Scam or fraud"
    },
    {
        text: "Intellectual property violation",
        value: "Intellectual property violation"
    },
    {
        text: "Sale of illegal or regulated goods",
        value: "Sale of illegal or regulated goods"
    },
    {
        text: "Suicide or self-injury",
        value: "Suicide or self-injury"
    },
    {
        text: "Eating disorders",
        value: "Eating disorders"
    },
];

const categories = {
    // "post_share": {
    //     title: "Share Post",
    //     icon: ""
    // },
    "user_share": {
        title: "Share Profile",
        icon: "share-outline"
    },
    "post_report": {
        title: "Report Post",
        icon: "flag"
    },
    // "user_report": {
    //     title: "Report User",
    //     icon: ""
    // },
    "user_block": {
        title: "Block User",
        icon: "slash"
    },
}

export const ExtendedMenuModal = (props: { userId: string, postId?: string, visible: boolean, onShouldClose: (userBlocked: boolean) => void }) => {
    const { visible, onShouldClose, postId, userId } = props;
    const toast = useToast();
    const [menuCategory, setMenuCategory] = useState<keyof typeof categories>();
    const [menuValue, setMenuValue] = useState<string>();
    const [details, setDetails] = useState<string>();

    const closeMenu = (block: boolean) => {
        setMenuValue(undefined);
        setMenuCategory(undefined);
        onShouldClose(block);
    }

    return <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => closeMenu(false)}
        style={{ width: '100%', alignItems: 'center' }}
    >
        <Card style={{ width: '90%' }}>
            <Header text={menuCategory !== "post_report" ? "Menu" : 'Reason for Reporting Post'} />
            <ScrollView style={{ maxHeight: 400 }}>
                {!menuCategory && Object.keys(categories).filter((k) => postId || k.substring(0, 5) !== "post_").map((k) => {
                    const item = categories[k as keyof typeof categories];
                    return <Pressable 
                                key={`id_${k}`}
                                onPress={async () => {
                        const cat = k as keyof typeof categories
                        switch (cat) {
                            case "user_share":
                                const link = "https://m.tradingpostapp.com/profile?userId=" + userId
                                Share.share({
                                    title: link,
                                    url: link,
                                    message: link
                                }, {})
                                closeMenu(false);
                                break;
                            case "user_block":
                                Api.User.extensions.setBlocked({
                                    userId,
                                    block: true
                                });
                                closeMenu(true);
                                break;
                            default:
                                setMenuCategory(cat);
                        }
                    }}>
                        <ElevatedSection title='' style={{ flexDirection: "row" }}>
                            <Text style={{ lineHeight: 32, flex: 1 }}>
                                {item.title}
                            </Text>
                            <Icon name={item.icon} height={32} width={32} />
                        </ElevatedSection>
                    </Pressable>

                })}
                {menuCategory === "post_report" && postId &&
                    <><Picker
                        placeholder={"Pick A Reason"}
                        value={menuValue}
                        onSelect={(item) => {
                            setMenuValue(HardcodedReportingReasons[item.row].value)
                        }}
                        items={
                            HardcodedReportingReasons.map(h => {
                                return {
                                    label: h.text,
                                    value: h.value
                                }
                            })
                        } />
                        {menuValue && <KeyboardAvoidingInput
                            value={details}
                            displayButton={false}
                            numLines={3}
                            placeholder={'Reason Details...'}
                            setValue={(text: string) => {
                                setDetails(text);
                            }}
                        />}
                    </>
                }
            </ScrollView>

            {postId && menuCategory === "post_report" && menuValue && <PrimaryButton

                style={{ marginTop: 10 }}
                onPress={async () => {

                    toast.show('Post has been reported!')
                    closeMenu(false);
                    await Api.Post.extensions.report({
                        postId: postId,
                        reason: "",
                        details: details || ""
                    })
                }} >Report</PrimaryButton>}
            {/*<SecondaryButton style={{ marginTop: 10 }} onPress={() => {
                closeMenu(false);
            }

            }>Cancel</SecondaryButton>*/}
        </Card>
    </Modal>

}