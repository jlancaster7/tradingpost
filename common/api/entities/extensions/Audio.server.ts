import {ensureServerExtensions} from ".";
import {getPriceCacheTask, getUserCache} from "../../cache";
import {IAudioGet, IAudioList, IAudioListExpanded} from "../interfaces";
import {execProc, getHivePool} from '../../../db';
import Audio from "./Audio";


export default ensureServerExtensions<Audio>({
    getAudio: async (r) => {
        const pool = await getHivePool;
        const limit = r.body.limit || 1;
        const result = await pool.query<IAudioListExpanded[]>(`SELECT da.id,
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
                                                        WHERE related_type = $1 
                                                        AND related_id = $2
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
                                                                "watchlist_note")
                                                        ORDER BY da.created_at DESC
                                                        LIMIT $3`, [r.body.relatedType, r.body.relatedId, limit]);

        if (!result.rowCount) {
            return []
        } else {
            return result.rows.map((a: any) => {
                let o: IAudioListExpanded = {
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
                    symbols: a.symbols,
                    created_at: a.created_at
                }
                return o;
            })
        }
    },
    getMostRecentUsers: async (r) => {
        const pool = await getHivePool;
        const results = pool.query<IAudioList[]>(`SELECT * FROM data_audio`)

        return []
    },
    getMostRecentWatchlists: async (r) => {
        const pool = await getHivePool;
        
        const result = await pool.query<IAudioListExpanded[]>(`SELECT da.id,
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
                                                        and (da.related_id, da.id) in (select related_id, max(id) as id from data_audio group by related_id)
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
                                                                "watchlist_note")
                                                        ORDER BY da.created_at DESC`, [r.extra.userId]);

        if (!result.rowCount) {
            return []
        } else {
            return result.rows.map((a: any) => {
                let o: IAudioListExpanded = {
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
                    symbols: a.symbols,
                    created_at: a.created_at
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