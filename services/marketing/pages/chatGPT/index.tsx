import React, { useEffect, useState } from "react";
import ChatGPTBlockOne from "../../components/ChatGPTBlockOne";
import AuthenticatedRoute from "../../components/AuthenticatedRoute";


function ChatGPT() {
    return (
        <>
            <ChatGPTBlockOne/>
        </>
    );
}
export default AuthenticatedRoute(ChatGPT);