import { NavigationProp } from "@react-navigation/native";
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { sizes } from "../../style";
import { IEntity } from "../../utils/hooks";

export const sideMargin = sizes.rem1_5;

export type CreateAccountProps = {
    user: IEntity<IUserGet>,
    toastMessage: (msg: string, delay?: number | undefined) => void
};

export function useChangeLock(caProps: CreateAccountProps, otherEntities?: IEntity<any>[]) {
    const output = useState( false)
    const setLockButtons = output[1];
    useEffect(() => {
    }, [ caProps.user.hasChanged, otherEntities]);

    return output
}

