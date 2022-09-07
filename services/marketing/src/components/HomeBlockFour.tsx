import React from "react";
import UserPicSvg from '../assets/UserPic1.svg';

const HomeBlockFour = () => {
    return (
        <div className="blockfour">
            <h1>Featured Analysts and Traders</h1>
            <div className="grid-container-b4">
                <div className='grid-item-b4'>
                    <img src={UserPicSvg} alt=""/>
                    <h1>Josh Lancaster</h1>
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
                <div className='grid-item-b4'>
                    <img src={UserPicSvg} alt=""/>
                    <h1>Josh Lancaster</h1>
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
                <div className='grid-item-b4'>
                    <img src={UserPicSvg} alt=""/>
                    <h1>Josh Lancaster</h1>
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
                    <button type={undefined} className="subButton" disabled={true}>Sign Up & Subscribe</button>
                </div>
                <div className='grid-item-b4'>
                    <img src={UserPicSvg} alt=""/>
                    <h1>Josh Lancaster</h1>
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