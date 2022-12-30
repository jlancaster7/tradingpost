import React from "react";
import ChatGPTCreateAccount from "../../../components/ChatGPTCreateAccount";
import UnauthenticatedRoute from "../../../components/UnauthenticatedRoute";


function CreateAccount() {
    return (
        <>
            <ChatGPTCreateAccount/>
        </>
    );
}

export default UnauthenticatedRoute(CreateAccount);