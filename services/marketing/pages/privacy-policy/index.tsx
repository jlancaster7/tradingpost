import React from "react";

function PrivacyPolicy() {
    return (
        <>
            <div className="privacyPolicy" style={{height: '100%'}}>
                <iframe src={`/DraftPrivacyPolicy-HivemindStudios-TradingpostApp.pdf#view=fitH`}
                        title="tradingpost-privacy-policy" width="100%"
                        height="100%"/>
            </div>
        </>
    );
}

export default PrivacyPolicy;