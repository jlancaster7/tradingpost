import React from "react";
import UserPic1Png from '../assets/UserPic1.png';
import UserPic2Png from '../assets/UserPic2.png';
import UserPic3Png from '../assets/UserPic3.png';
import UserPic4Png from '../assets/UserPic4.png';

const HomeBlockFour = () => {
    return (
        <div className="blockfour">
            <h1>Featured Analysts and Traders</h1>
            <div className="grid-container-b4">
                <div className='grid-item-b4'>
                    <img src={UserPic1Png} alt=""/>
                    <h1>BTD Capital</h1>
                    <p>Generalist</p>
                    <div className='inner-grid-container-b4'>
                        <div className='inner-grid-item-b4'>
                            <h4>Top Position</h4>
                            <p>ENPH</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4># of Positions</h4>
                            <p>12</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4>Subscribers</h4>
                            <p>211</p>
                        </div>

                    </div>

                </div>
                <div className='grid-item-b4'>
                    <img src={UserPic2Png} alt=""/>
                    <h1>Nathan Feller</h1>
                    <p>Mid-Cap Tech</p>
                    <div className='inner-grid-container-b4'>
                        <div className='inner-grid-item-b4'>
                            <h4>Top Position</h4>
                            <p>CRWD</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4># of Positions</h4>
                            <p>21</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4>Subscribers</h4>
                            <p>493</p>
                        </div>

                    </div>

                </div>
                <div className='grid-item-b4'>
                    <img src={UserPic3Png} alt=""/>
                    <h1>Steve Young</h1>
                    <p>Oil & Gas</p>
                    <div className='inner-grid-container-b4'>
                        <div className='inner-grid-item-b4'>
                            <h4>Top Position</h4>
                            <p>OXY</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4># of Positions</h4>
                            <p>16</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4>Subscribers</h4>
                            <p>246</p>
                        </div>

                    </div>
                    <button type={undefined} className="subButton" disabled={true}>Sign Up & Subscribe</button>
                </div>
                <div className='grid-item-b4'>
                    <img src={UserPic4Png} alt=""/>
                    <h1>Janet Johnson</h1>
                    <p>Specialty Finance</p>
                    <div className='inner-grid-container-b4'>
                        <div className='inner-grid-item-b4'>
                            <h4>Top Position</h4>
                            <p>AFRM</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4># of Positions</h4>
                            <p>18</p>
                        </div>
                        <div className='inner-grid-item-b4'>
                            <h4>Subscribers</h4>
                            <p>157</p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default HomeBlockFour;