import React from "react";
import ChatGPTLogin from "../../../components/ChatGPTLogin";
import UnauthenticatedRoute from "../../../components/UnauthenticatedRoute";


function Login() {
    return (
        <>
            <ChatGPTLogin/>
        </>
    );
}

export default UnauthenticatedRoute(Login);