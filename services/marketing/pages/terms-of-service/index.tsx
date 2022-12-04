import React from "react";
//import ToS from '../../public/TermsofService-HivemindStudios.htm'

function TermsOfService() {
    return (
        <>
            <div className="TermsOfService" style={{
                height: '82vh'
                }}>
                <iframe src={'TermsofService-HivemindStudios.htm'}
                        title="tradingpost-terms-of-service" 
                        width="100%"
                        height="100%"
                        />
            </div>
        </>
    );
}

export default TermsOfService;