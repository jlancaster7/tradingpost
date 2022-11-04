import React from "react";
import DummyImage from '../public/DummyImage1.png';
import VerifiedPortfolios from '../public/Verifiedportfolios.svg';
import Image from 'next/image'

const HomeBlockTwo = () => {
    return (
        <div className="blocktwo">
            <Image src={DummyImage} alt=""/>
            <div className="blocktext">
                <Image src={VerifiedPortfolios} alt="verified portfolio image"/>
                <h1>Verified portfolios, with total control over who sees your data</h1>
                <p>Connect your portfolio to TradingPost and control who can view your articles, charts,
                    trades, and watchlists. Make it public, share with friends and family, or build a
                    paying subscriber base. Remove access from problematic users, because at TradingPost
                    you have total control over who views your content.
                </p>
            </div>
        </div>
    );
}

export default HomeBlockTwo;