import { useEffect, useRef, useState } from "react"
import { View, Text, Pressable } from "react-native"
import { List } from "../components/List"
import { ElevatedSection } from "../components/Section"
import { flex, paddView } from "../style"
import { Api, Interface } from '@tradingpost/common/api'
import { ProfileButton } from "../components/ProfileButton"
import { useToast } from "react-native-toast-notifications"
import { IUserList } from "@tradingpost/common/api/entities/interfaces"

export const BlockScreen = () => {
    const [blockedUsers, setBlockedUsers] = useState<Interface.IUserList[]>()
    useEffect(() => {
        if (!blockedUsers)
            Api.User.extensions.getBlocked().then((blockedUsers) => {
                setBlockedUsers(blockedUsers)
            })
    }, [blockedUsers])
    const toast = useToast();
    const currentRef = useRef<string>()
    return <View style={[paddView]}>
        <ElevatedSection title="Blocked Users" style={flex}>
            <List
                data={blockedUsers}
                loadingItem={""}
                renderItem={(u) => {
                    return typeof u.item === "string" ? <Text>Loading</Text> : <Pressable
                        onPress={() => {
                            if (currentRef.current !== (u.item as IUserList).id) {
                                currentRef.current = (u.item as IUserList).id;
                                toast.show(`Tap again to unblock ${(u.item as IUserList).handle}`)
                                setTimeout(() => {
                                    currentRef.current = undefined;
                                }, 3000)
                            }
                            else {
                                const id = currentRef.current;
                                currentRef.current = undefined;
                                Api.User.extensions.setBlocked({
                                    userId: id || "",
                                    block: false
                                }).then(() => {
                                    setBlockedUsers(undefined);
                                })
                            }
                        }}
                        style={{ flexDirection: "row" }}>
                        <ProfileButton userId={u.item.id} profileUrl={u.item.profile_url || ""} size={32} />
                        <View>
                            <Text>{u.item.display_name || "No Display Name"}</Text>
                            <Text>{u.item.handle}</Text>
                        </View>
                    </Pressable>
                }}
            />
        </ElevatedSection>

    </View>
}