import {ensureServerExtensions} from "."
import Comment from "./Comment"
import {getHivePool} from "../../../db";
import {ICommentList} from "../interfaces";

export interface ICommentPlus extends ICommentList {
    created_at: Date,
    updated_at: Date
    handle: string,
    display_name: string,
    profile_url: string,
    subscription: { [key: string]: string }
}

export default ensureServerExtensions<Comment>({
    postList: async (r) => {
        const pool = await getHivePool;
        const query = `SELECT q.id,
                              related_type,
                              related_id,
                              comment,
                              user_id,
                              created_at,
                              updated_at,
                              f.handle,
                              f.display_name,
                              f.profile_url,
                              f.subscription
                       FROM data_comment AS q
                                LEFT JOIN api_user_list('{}') AS f
                                          ON
                                              q.user_id = f.id
                       WHERE q.related_type = $1
                         AND q.related_id = $2
        `
        const result = await pool.query(query, [r.body.type, r.body.id]);
        if (!result.rowCount) {
            return []
        } else {
            return result.rows.map((a: any) => {
                let o: ICommentPlus = {
                    id: a.id,
                    related_type: a.related_type,
                    related_id: a.related_id,
                    comment: a.comment,
                    user_id: a.user_id,
                    created_at: a.created_at,
                    updated_at: a.updated_at,
                    handle: a.handle,
                    display_name: a.display_name,
                    profile_url: a.profile_url,
                    subscription: a.subscriber
                }
                return o;
            })
        }

    }
})