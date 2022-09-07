import React from "react";
import DummyImage from '../assets/DummyImage1.png';
import VerifiedPortfoliosSvg from '../assets/Verifiedportfolios.svg';

const HomeBlockTwo = () => {
    return (
        <div className="blocktwo">
            <img src={DummyImage} alt=""/>
            <div className="blocktext">
                <img src={VerifiedPortfoliosSvg} alt="verified portfolio image"/>
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