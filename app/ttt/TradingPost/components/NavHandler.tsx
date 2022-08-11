import React, { PropsWithChildren } from "react"

export const NavHandler: React.FC<PropsWithChildren<{}>> = (props) => {
    //TODO: abstract navigation based on deep linking
    return <>
        {props.children}
    </>
}