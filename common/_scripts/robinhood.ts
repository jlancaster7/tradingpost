import {Api} from '../api'

(async () => {
    const response = await Api.Brokerage.extensions.robinhoodLogin({
        username: "djbozentka@gmail.com",
        challengeType: "sms",
        mfaCode: null,
        password: "hbr-ycr_nmh5byk*VHD"
    });
    console.log(response)
})()