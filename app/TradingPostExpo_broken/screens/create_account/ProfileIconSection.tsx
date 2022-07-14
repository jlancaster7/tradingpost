import { Icon } from "@ui-kitten/components";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { CreateAccountProps } from "../CreateAccountScreen"
import { ISecurityList } from '@tradingpost/common/api/entities/interfaces'
const ProfileIconSection = (props: CreateAccountProps) => {
    return <ScrollWithButtons
        buttons={{
            right: {
                text: "",
                onPress: () => {
                    props.next();
                }
            },
            left: {
                text: "Back",
                onPress: props.back
            }
        }}
    >
        <Icon name="person-fill"></Icon>
    </ScrollWithButtons>
}