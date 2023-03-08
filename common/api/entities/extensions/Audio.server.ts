import {ensureServerExtensions} from ".";
import {getPriceCacheTask, getUserCache} from "../../cache";
import {IAudioGet, IAudioList} from "../interfaces";
import {execProc, getHivePool} from '../../../db';
import Audio from "./Audio";


export default ensureServerExtensions<Audio>({
    getMostRecentUsers: async (r) => {
        const pool = await getHivePool;
        const results = pool.query<IAudioList[]>(`SELECT * FROM data_audio`)

        return []
    },
    getMostRecentWatchlists: async (r) => {
        const pool = await getHivePool;
        
        const result = await pool.query<IAudioList[]>(`SELECT da.id,
                                                                da.related_type,
                                                                da.related_id,
                                                                da.audio_url,
                                                                da.transcript,
                                                                da.user_id,
                                                                da.created_at,
                                                                da.updated_at,
                                                                du.handle,
                                                                du.profile_url,
                                                                dw.name as "watchlist_name", 
                                                                dw.note as "watchlist_note",
                                                                JSONB_AGG(dwi.symbol) as symbols
                                                        FROM data_audio da 
                                                        INNER JOIN data_watchlist dw
                                                            ON da.related_id = dw.id::text
                                                        INNER JOIN data_user du
                                                            ON da.user_id = du.id 
                                                        INNER JOIN data_watchlist_item dwi
                                                            ON dw.id = dwi.watchlist_id
                                                        WHERE related_type = 'watchlist'
                                                        AND CASE
                                                            WHEN da.user_id != $1 THEN dw.type = 'public'
                                                            else true
                                                        end
                                                        group by (da.id,
                                                                da.related_type,
                                                                da.related_id,
                                                                da.audio_url,
                                                                da.transcript,
                                                                da.user_id,
                                                                da.created_at,
                                                                da.updated_at,
                                                                du.handle,
                                                                du.profile_url,
                                                                "watchlist_name", 
                                                                "watchlist_note")`, [r.extra.userId]);

        if (!result.rowCount) {
            return []
        } else {
            return result.rows.map((a: any) => {
                let o: (IAudioList & {handle: string, profile_url: string, watchlist_name: string, watchlist_note: string, symbols: string[]}) = {
                    id: a.id,
                    related_type: a.related_type,
                    related_id: a.related_id,
                    audio_url: a.audio_url,
                    transcript: a.transcript,
                    user_id: a.user_id,
                    handle: a.handle,
                    profile_url: a.profile_url,
                    watchlist_name: a.watchlist_name,
                    watchlist_note: a.watchlist_note,
                    symbols: a.symbols
                }
                return o;
            })
        }
    },
    getMostRecentCompanies: async (r) => {
        const pool = await getHivePool;
        const results = pool.query<IAudioList[]>(`SELECT * FROM data_audio`)

        return []
    }
})