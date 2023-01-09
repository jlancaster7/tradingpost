import { Modal, Card, Button, Icon } from "@ui-kitten/components"
import { Share, ScrollView, Pressable, StyleSheet, Text } from "react-native"
import { useToast } from "react-native-toast-notifications"
import toast from "react-native-toast-notifications/lib/typescript/toast"
import { Header } from "./Headers"
import { ElevatedSection } from "./Section"
import { Api } from '@tradingpost/common/api'
import { useState } from "react"


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

    return <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => {
            setMenuCategory(undefined);
            onShouldClose(false)
        }
        }
        style={{ width: '100%', alignItems: 'center' }}
    >
        <Card style={{ width: '90%' }}>
            <Header text={menuCategory !== "post_report" ? "Menu" : 'Reason for Reporting Post'} />
            <ScrollView style={{ maxHeight: 400 }}>
                {!menuCategory && Object.keys(categories).filter((k) => postId || k.substring(0, 5) !== "post_").map((k) => {
                    const item = categories[k as keyof typeof categories];
                    return <Pressable onPress={async () => {
                        const cat = k as keyof typeof categories
                        switch (cat) {
                            case "user_share":
                                const link = "https://m.tradingpostapp.com/profile?userId=" + userId
                                Share.share({
                                    title: link,
                                    url: link,
                                    message: link
                                }, {})
                                onShouldClose(false);

                                break;
                            case "user_block":
                                Api.User.extensions.setBlocked({
                                    userId,
                                    block: true
                                });
                                onShouldClose(true);
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
                {menuCategory === "post_report" && postId && HardcodedReportingReasons.map(h => {
                    return (
                        <Pressable onPress={async () => {
                            onShouldClose(false);
                            toast.show('Post has been reported!')
                            setMenuCategory(undefined);
                            await Api.Post.extensions.report({
                                postId: postId,
                                reason: h.value
                            })
                        }}>
                            <ElevatedSection title=''>
                                <Text>
                                    {h.text}
                                </Text>
                            </ElevatedSection>
                        </Pressable>
                    )
                })}
            </ScrollView>
            <Button style={{ marginTop: 10 }} onPress={() => {
                onShouldClose(false)
                setMenuCategory(undefined);
            }

            }>Cancel</Button>
        </Card>
    </Modal>

}