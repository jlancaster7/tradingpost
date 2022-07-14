import { Icon } from "@ui-kitten/components";
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { CreateAccountProps } from "../CreateAccountScreen"

export const ProfileIconSection = (props: CreateAccountProps) => {
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
        <Icon name="person" ></Icon>
    </ScrollWithButtons>
}