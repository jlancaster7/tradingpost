import User, { UploadProfilePicBody } from "./User"
import { ensureServerExtensions } from "."
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import UserApi, { IUserUpdate } from '../apis/UserApi'
const client = new S3Client({
    region: "us-east-1"
});

export default ensureServerExtensions<User>({
    uploadProfilePic: async (req) => {
        const body = req.body as UploadProfilePicBody;
        if (req.extra.userId !== body.userId) {
            await client.send(new PutObjectCommand({
                Bucket: "tradingpost-images",
                Key: `/profile-pics/${body.userId}`,
                Body: body.image
            }));
            await UserApi.update(body.userId, {
                has_profile_pic: true
            });
        }
        else
            throw {
                message: "Unathorized",
                code: 401
            }
    }
});