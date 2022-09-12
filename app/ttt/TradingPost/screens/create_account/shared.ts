import { NavigationProp } from "@react-navigation/native";
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { sizes } from "../../style";
import { IEntity } from "../../utils/hooks";

export const sideMargin = sizes.rem1_5;

export type CreateAccountProps = {
    saveOnly?: boolean,
    user: IEntity<IUserGet>,
    //login?: LoginResult,
    //componentId: string,
    toastMessage: (msg: string, delay?: number | undefined) => void,//ToastMessageFunction,
    //    prompt: PromptFunc,
    setWizardIndex: Dispatch<SetStateAction<number>>,
    navigation: NavigationProp<any>
    /*
    next(skip?: number): void,
    back(): void,
    navigateByName(name: keyof typeof screens): void
    */
};
//export type AuthAccountProps = CreateAccountProps & { user: IEntity<IAuthenticatedUser> }
export function useChangeLock(caProps: CreateAccountProps, otherEntities?: IEntity<any>[]) {
    const output = useState(caProps.saveOnly || false)
    const setLockButtons = output[1];
    useEffect(() => {
        if (caProps.saveOnly) {
            const otherHasChanged = Boolean(otherEntities?.find((e) => e.hasChanged))
            setLockButtons(!(otherHasChanged || caProps.user.hasChanged));
        }
    }, [caProps.saveOnly, caProps.user.hasChanged, otherEntities]);

    return output
}

