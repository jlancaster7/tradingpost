import React from "react";
import privacyPolicyPdf from '../assets/DraftPrivacyPolicy-HivemindStudios-TradingpostApp.pdf';

function PrivacyPolicy() {
    return (
        <>
            <div className="privacyPolicy">
                <iframe src={`${privacyPolicyPdf}#view=fitH`} title="tradingpost-privacy-policy" width="100%" height="100%"/>
            </div>
        </>
    );
}

export default PrivacyPolicy;