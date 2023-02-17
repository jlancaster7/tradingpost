DROP TABLE IF EXISTS errors;CREATE TEMP TABLE errors (type TEXT,entityName TEXT, name TEXT,columnname text, message TEXT, context TEXT, detail TEXT);
/* No changes to data_alert [alert]*/
ALTER TABLE data_block_list
ALTER COLUMN blocked_user_id  SET NOT NULL,
ALTER COLUMN blocked_by_id  SET NOT NULL;
/* No changes to data_bookmark [bookmark]*/
/* No changes to data_brokerage [brokerage]*/
/* No changes to data_comment [comment]*/
/* No changes to ibkr_account [ibkr]*/
/* No changes to data_notification [notification]*/
CREATE TEMP TABLE pg_temp.data_notification_subscription(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    type TEXT,
    disabled TEXT,
    data JSON,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
/* No changes to data_platform_claim [platform_claim]*/
/* No changes to data_post [post]*/
/* No changes to data_subscriber [subscriber]*/
/* No changes to data_subscription [subscription]*/
CREATE TEMP TABLE pg_temp.tradingpost_transactio(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    account_id BIGINT,
    security_id TEXT,
    security_type TEXT,
    date TEXT,
    quantity MONEY,
    price MONEY,
    amount MONEY,
    fees MONEY,
    type TEXT,
    currency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
/* No changes to data_upvote [upvote]*/
/* No changes to data_user [user]*/
/* No changes to data_watchlist [watchlist]*/
/* No changes to data_watchlist_item [watchlist_item]*/
/* No changes to data_watchlist_saved [watchlist_saved]*/

    DROP FUNCTION IF EXISTS pg_temp.view_alert_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_alert_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"data" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."data", d."type", d."user_id" FROM pg_temp.data_alert as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_user_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_user_list(
        request jsonb)
        RETURNS TABLE("id" UUID,"handle" text,"tags" json,"display_name" text,"profile_url" text,"subscription" json,"social_analytics" json,"is_deleted" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."handle", d."tags", (concat(d."first_name",' ',d."last_name")) as "display_name", d."profile_url", (SELECT json_agg(a)->0 FROM  	(SELECT  "sub"."id", sub."cost", "sub"."settings", 		 (SELECT  count(*) FROM data_subscriber r where r."subscription_id" = "sub"."id" ) as "count",          exists(SELECT  * FROM data_subscriber r where r."subscription_id" = "sub"."id" and  r."user_id" = (request->>'user_id')::UUID and r."approved" = true ) as "is_subscribed", exists(SELECT  * FROM data_subscriber r where r."subscription_id" = "sub"."id" and  r."user_id" = (request->>'user_id')::UUID and r."approved" = false ) as "is_pending" 		 FROM data_subscription as "sub" where "sub"."user_id" = d."id" 		 group by sub."id", sub."cost" 	) as a) as "subscription", d."social_analytics", d."is_deleted" FROM pg_temp.data_user as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_block_list_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_block_list_insert(
        request jsonb)
        RETURNS TABLE("blocked_by_id" UUID,"blocked_user_id" UUID,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."blocked_by_id", d."blocked_user_id", d."id" FROM pg_temp.data_block_list as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_bookmark_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_bookmark_list(
        request jsonb)
        RETURNS TABLE("user_id" UUID,"post_id" text,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."user_id", d."post_id", d."id" FROM pg_temp.data_bookmark as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_bookmark_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_bookmark_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"post_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."post_id", d."user_id" FROM pg_temp.data_bookmark as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_comment_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_comment_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"related_type" text,"related_id" text,"comment" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."related_type", d."related_id", d."comment", d."user_id" FROM pg_temp.data_comment as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_comment_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_comment_get(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."comment", d."id", d."related_type", d."related_id", d."user_id" FROM pg_temp.data_comment as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_comment_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_comment_insert(
        request jsonb)
        RETURNS TABLE("related_type" text,"related_id" text,"comment" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."related_type", d."related_id", d."comment", d."user_id" FROM pg_temp.data_comment as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_platform_claim_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_platform_claim_list(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID,"platform_user_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."platform", d."claims", d."id", d."user_id", d."platform_user_id" FROM pg_temp.data_platform_claim as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_platform_claim_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_platform_claim_get(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."platform", d."claims", d."id", d."user_id" FROM pg_temp.data_platform_claim as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_upvote_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_upvote_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"post_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."user_id", d."post_id" FROM pg_temp.data_upvote as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscriber_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscriber_insert(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"user_id" UUID,"start_date" TIMESTAMP WITH TIME ZONE,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_id", d."user_id", d."start_date", d."approved" FROM pg_temp.data_subscriber as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscriber_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscriber_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_id", d."approved" FROM pg_temp.data_subscriber as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscription_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscription_insert(
        request jsonb)
        RETURNS TABLE("name" text,"settings" json,"cost" money,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."name", d."settings", d."cost", d."user_id" FROM pg_temp.data_subscription as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscription_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscription_update(
        request jsonb)
        RETURNS TABLE("name" text,"settings" json,"id" BIGINT,"cost" money,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."name", d."settings", d."id", d."cost", d."user_id" FROM pg_temp.data_subscription as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_upvote_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_upvote_list(
        request jsonb)
        RETURNS TABLE("post_id" text,"user_id" UUID,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."post_id", d."user_id", d."id" FROM pg_temp.data_upvote as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_user_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_user_update(
        request jsonb)
        RETURNS TABLE("id" UUID,"first_name" text,"last_name" text,"analyst_profile" json,"has_profile_pic" boolean,"profile_url" text,"settings" json,"banner_url" text,"bio" text,"social_analytics" json,"is_deleted" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."first_name", d."last_name", d."analyst_profile", d."has_profile_pic", d."profile_url", d."settings", d."banner_url", d."bio", d."social_analytics", d."is_deleted" FROM pg_temp.data_user as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_item_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_item_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text,"date_added" TIMESTAMP WITH TIME ZONE)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."symbol", d."watchlist_id", d."note", (d."created_at") as "date_added" FROM pg_temp.data_watchlist_item as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_saved_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_saved_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"watchlist_id" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."user_id", d."watchlist_id" FROM pg_temp.data_watchlist_saved as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_item_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_item_insert(
        request jsonb)
        RETURNS TABLE("symbol" text,"watchlist_id" bigint,"note" text,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."symbol", d."watchlist_id", d."note", d."id" FROM pg_temp.data_watchlist_item as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_item_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_item_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text,"date_added" TIMESTAMP WITH TIME ZONE)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."symbol", d."watchlist_id", d."note", (d."created_at") as "date_added" FROM pg_temp.data_watchlist_item as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_block_list_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_block_list_list(
        request jsonb)
        RETURNS TABLE("blocked_by_id" UUID,"blocked_user_id" UUID,"blocked_user" json,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."blocked_by_id", d."blocked_user_id", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."blocked_by_id") as "blocked_user", d."id" FROM pg_temp.data_block_list as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_block_list_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_block_list_get(
        request jsonb)
        RETURNS TABLE("blocked_by_id" UUID,"blocked_user_id" UUID,"blocked_user" json,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."blocked_by_id", d."blocked_user_id", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."blocked_by_id") as "blocked_user", d."id" FROM pg_temp.data_block_list as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_post_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_post_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"body" text,"upvoted_count" bigint,"subscription_level" text,"user" json,"comment_count" integer,"title" text,"max_width" money,"aspect_ratio" money)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."body", (SELECT count(*) FROM pg_temp.view_upvote_get(request) as t WHERE t."post_id"=d."id") as "upvoted_count", d."subscription_level", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", (SELECT count(*) FROM pg_temp.view_comment_get(request) as t WHERE t."related_id"=d."id") as "comment_count", d."title", d."max_width", d."aspect_ratio" FROM pg_temp.data_post as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_post_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_post_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_level" text,"body" text,"upvoted_count" bigint,"user" json,"comment_count" integer,"title" text,"aspect_ratio" money,"max_width" money)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_level", d."body", (SELECT count(*) FROM pg_temp.view_upvote_get(request) as t WHERE t."post_id"=d."id") as "upvoted_count", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", (SELECT count(*) FROM pg_temp.view_comment_get(request) as t WHERE t."related_id"=d."id") as "comment_count", d."title", d."aspect_ratio", d."max_width" FROM pg_temp.data_post as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscriber_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscriber_list(
        request jsonb)
        RETURNS TABLE("subscription_id" bigint,"user_id" UUID,"start_date" TIMESTAMP WITH TIME ZONE,"due_date" TIMESTAMP WITH TIME ZONE,"id" BIGINT,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."subscription_id", d."user_id", d."start_date", d."due_date", d."id", (SELECT json_agg(t) FROM pg_temp.view_subscription_get(request) as t WHERE t.id=d."subscription_id") as "subscription", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", d."approved" FROM pg_temp.data_subscriber as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscription_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscription_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."settings", d."cost", d."name", d."user_id", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM pg_temp.data_subscription as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscriber_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscriber_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_id", d."start_date", d."user_id", d."due_date", (SELECT json_agg(t) FROM pg_temp.view_subscription_get(request) as t WHERE t.id=d."subscription_id") as "subscription", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", d."approved" FROM pg_temp.data_subscriber as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscription_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscription_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"name" text,"cost" money,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."user_id", d."name", d."cost", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM pg_temp.data_subscription as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_user_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_user_get(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text,"analyst_profile" json,"subscription" json,"settings" json,"social_analytics" json,"is_deleted" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."handle", CASE WHEN d.id = (request->>'user_id')::UUID THEN d."email" END as "email", (SELECT json_agg(t) FROM pg_temp.view_platform_claim_list(request) as t WHERE t.user_id=d."id") as "claims", d."bio", d."tags", d."id", (concat(d."first_name",' ',d."last_name")) as "display_name", d."first_name", d."last_name", d."profile_url", d."banner_url", d."analyst_profile", (SELECT json_agg(a)->0 FROM  	(SELECT  "sub"."id", sub."cost", "sub"."settings", 		 (SELECT  count(*) FROM data_subscriber r where r."subscription_id" = "sub"."id" ) as "count",          exists(SELECT  * FROM data_subscriber r where r."subscription_id" = "sub"."id" and  r."user_id" = (request->>'user_id')::UUID and r."approved" = true ) as "is_subscribed", exists(SELECT  * FROM data_subscriber r where r."subscription_id" = "sub"."id" and  r."user_id" = (request->>'user_id')::UUID and r."approved" = false ) as "is_pending" 		 FROM data_subscription as "sub" where "sub"."user_id" = d."id" 		 group by sub."id", sub."cost" 	) as a) as "subscription", d."settings", d."social_analytics", d."is_deleted" FROM pg_temp.data_user as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"user" json,"type" text,"user_id" UUID,"item_count" bigint,"saved_by_count" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."name", d."note", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", d."type", d."user_id", (SELECT count(*) FROM pg_temp.view_watchlist_item_list(request) as t WHERE t."watchlist_id"=d."id") as "item_count", (SELECT count(*) FROM pg_temp.view_watchlist_saved_list(request) as t WHERE t."watchlist_id"=d."id") as "saved_by_count" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_get(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", (SELECT json_agg(t) FROM pg_temp.view_watchlist_item_insert(request) as t WHERE t.watchlist_id=d."id") as "items", d."note", d."name", d."id", d."type", (SELECT count(*) FROM pg_temp.view_watchlist_saved_list(request) as t WHERE t."watchlist_id"=d."id") as "saved_by_count", EXISTS(SELECT * FROM pg_temp.view_watchlist_saved_list(request) as t WHERE t.watchlist_id=d."id") as "is_saved" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_insert(
        request jsonb)
        RETURNS TABLE("name" text,"note" text,"items" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."name", d."note", (SELECT json_agg(t) FROM pg_temp.view_watchlist_item_insert(request) as t WHERE t.watchlist_id=d."id") as "items", d."type", d."user_id" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"items" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."name", d."note", (SELECT json_agg(t) FROM pg_temp.view_watchlist_item_insert(request) as t WHERE t.watchlist_id=d."id") as "items", d."type", d."user_id" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;







    DROP FUNCTION IF EXISTS pg_temp.api_alert_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_alert_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"data" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_alert_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.api_block_list_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_block_list_insert(
        request jsonb)
        RETURNS TABLE("blocked_by_id" UUID,"blocked_user_id" UUID,"blocked_user" json,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO pg_temp.data_block_list(
  blocked_user_id,
blocked_by_id)
VALUES ((request->'data'->>'blocked_user_id')::UUID,
(request->'data'->>'blocked_by_id')::UUID)
returning pg_temp.data_block_list.id INTO _idField;
return query SELECT * FROM pg_temp.view_block_list_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;




    DROP FUNCTION IF EXISTS pg_temp.api_block_list_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_block_list_get(
        request jsonb)
        RETURNS TABLE("blocked_by_id" UUID,"blocked_user_id" UUID,"blocked_user" json,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_block_list_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_block_list_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_block_list_list(
        request jsonb)
        RETURNS TABLE("blocked_by_id" UUID,"blocked_user_id" UUID,"blocked_user" json,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_block_list_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;





    DROP FUNCTION IF EXISTS pg_temp.api_bookmark_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_bookmark_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"post_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_bookmark_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_bookmark_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_bookmark_list(
        request jsonb)
        RETURNS TABLE("user_id" UUID,"post_id" text,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_bookmark_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;








    DROP FUNCTION IF EXISTS pg_temp.api_comment_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_comment_insert(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO pg_temp.data_comment(
  related_type,
related_id,
comment,
user_id)
VALUES ((request->'data'->>'related_type')::text,
(request->'data'->>'related_id')::text,
(request->'data'->>'comment')::text,
(request->>'user_id')::UUID)
returning pg_temp.data_comment.id INTO _idField;
return query SELECT * FROM pg_temp.view_comment_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;




    DROP FUNCTION IF EXISTS pg_temp.api_comment_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_comment_get(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_comment_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_comment_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_comment_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"related_type" text,"related_id" text,"comment" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_comment_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;


























    DROP FUNCTION IF EXISTS pg_temp.api_platform_claim_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_platform_claim_get(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_platform_claim_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_platform_claim_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_platform_claim_list(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID,"platform_user_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_platform_claim_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;





    DROP FUNCTION IF EXISTS pg_temp.api_post_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_post_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_level" text,"body" text,"upvoted_count" bigint,"user" json,"comment_count" integer,"title" text,"aspect_ratio" money,"max_width" money)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_post_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_post_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_post_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"body" text,"upvoted_count" bigint,"subscription_level" text,"user" json,"comment_count" integer,"title" text,"max_width" money,"aspect_ratio" money)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_post_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.api_subscriber_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscriber_insert(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO pg_temp.data_subscriber(
  subscription_id,
user_id,
start_date,
approved)
VALUES ((request->'data'->>'subscription_id')::bigint,
(request->>'user_id')::UUID,
(request->'data'->>'start_date')::timestamptz,
(request->'data'->>'approved')::boolean)
returning pg_temp.data_subscriber.id INTO _idField;
return query SELECT * FROM pg_temp.view_subscriber_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_subscriber_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscriber_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE pg_temp.data_subscriber v SET subscription_id =  tp.prop_or_default(request->'data' ,'subscription_id',v.subscription_id), 
approved =  tp.prop_or_default(request->'data' ,'approved',v.approved) WHERE v."id" = (request->'data'->>'id')::BIGINT;
return query SELECT * FROM pg_temp.view_subscriber_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_subscriber_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscriber_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_subscriber_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_subscriber_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscriber_list(
        request jsonb)
        RETURNS TABLE("subscription_id" bigint,"user_id" UUID,"start_date" TIMESTAMP WITH TIME ZONE,"due_date" TIMESTAMP WITH TIME ZONE,"id" BIGINT,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_subscriber_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.api_subscription_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscription_insert(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO pg_temp.data_subscription(
  user_id,
name,
cost,
settings)
VALUES ((request->>'user_id')::UUID,
(request->'data'->>'name')::text,
(request->'data'->>'cost')::money,
(request->'data'->>'settings')::json)
returning pg_temp.data_subscription.id INTO _idField;
return query SELECT * FROM pg_temp.view_subscription_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_subscription_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscription_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE pg_temp.data_subscription v SET user_id= (request->>'user_id')::UUID, 
name =  tp.prop_or_default(request->'data' ,'name',v.name), 
cost =  tp.prop_or_default(request->'data' ,'cost',v.cost), 
settings =  tp.prop_or_default(request->'data' ,'settings',v.settings) WHERE v."id" = (request->'data'->>'id')::BIGINT;
return query SELECT * FROM pg_temp.view_subscription_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_subscription_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscription_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_subscription_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_subscription_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscription_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"name" text,"cost" money,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_subscription_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;












    DROP FUNCTION IF EXISTS pg_temp.api_upvote_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_upvote_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"post_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_upvote_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_upvote_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_upvote_list(
        request jsonb)
        RETURNS TABLE("post_id" text,"user_id" UUID,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_upvote_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;



    DROP FUNCTION IF EXISTS pg_temp.api_user_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_user_update(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text,"analyst_profile" json,"subscription" json,"settings" json,"social_analytics" json,"is_deleted" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE pg_temp.data_user v SET first_name =  tp.prop_or_default(request->'data' ,'first_name',v.first_name), 
last_name =  tp.prop_or_default(request->'data' ,'last_name',v.last_name), 
profile_url =  tp.prop_or_default(request->'data' ,'profile_url',v.profile_url), 
settings =  tp.prop_or_default(request->'data' ,'settings',v.settings), 
bio =  tp.prop_or_default(request->'data' ,'bio',v.bio), 
banner_url =  tp.prop_or_default(request->'data' ,'banner_url',v.banner_url), 
analyst_profile =  tp.prop_or_default(request->'data' ,'analyst_profile',v.analyst_profile), 
has_profile_pic =  tp.prop_or_default(request->'data' ,'has_profile_pic',v.has_profile_pic), 
social_analytics =  tp.prop_or_default(request->'data' ,'social_analytics',v.social_analytics), 
is_deleted =  tp.prop_or_default(request->'data' ,'is_deleted',v.is_deleted) WHERE v."id" = (request->'data'->>'id')::UUID;
return query SELECT * FROM pg_temp.view_user_get(request) as v WHERE v."id" = (request->'data'->>'id')::UUID;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_user_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_user_get(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text,"analyst_profile" json,"subscription" json,"settings" json,"social_analytics" json,"is_deleted" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_user_get(request) as v WHERE v."id" = (request->'data'->>'id')::UUID;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_user_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_user_list(
        request jsonb)
        RETURNS TABLE("id" UUID,"handle" text,"tags" json,"display_name" text,"profile_url" text,"subscription" json,"social_analytics" json,"is_deleted" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_user_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::UUID from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_insert(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO pg_temp.data_watchlist(
  name,
note,
user_id,
type)
VALUES ((request->'data'->>'name')::text,
(request->'data'->>'note')::text,
(request->>'user_id')::UUID,
(request->'data'->>'type')::text)
returning pg_temp.data_watchlist.id INTO _idField;
DELETE FROM pg_temp.data_watchlist_item t WHERE t.watchlist_id = _idField;
IF request->'data' ? 'items' THEN
INSERT INTO pg_temp.data_watchlist_item(watchlist_id,symbol,note)
SELECT _idField,(value->>'symbol')::text,(value->>'note')::text FROM json_array_elements((request->'data'->>'items')::json);
END IF;
return query SELECT * FROM pg_temp.view_watchlist_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_update(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE pg_temp.data_watchlist v SET name =  tp.prop_or_default(request->'data' ,'name',v.name), 
note =  tp.prop_or_default(request->'data' ,'note',v.note), 
user_id =  tp.prop_or_default(request->'data' ,'user_id',v.user_id), 
type =  tp.prop_or_default(request->'data' ,'type',v.type) WHERE v."id" = (request->'data'->>'id')::BIGINT;
DELETE FROM pg_temp.data_watchlist_item t WHERE t.watchlist_id = (request->'data'->>'id')::BIGINT;
IF request->'data' ? 'items' THEN
INSERT INTO pg_temp.data_watchlist_item(watchlist_id,symbol,note)
SELECT (request->'data'->>'id')::BIGINT,(value->>'symbol')::text,(value->>'note')::text FROM json_array_elements((request->'data'->>'items')::json);
END IF;
return query SELECT * FROM pg_temp.view_watchlist_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_get(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"user" json,"type" text,"user_id" UUID,"item_count" bigint,"saved_by_count" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_item_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_item_insert(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text,"date_added" TIMESTAMP WITH TIME ZONE)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO pg_temp.data_watchlist_item(
  symbol,
watchlist_id,
note)
VALUES ((request->'data'->>'symbol')::text,
(request->'data'->>'watchlist_id')::bigint,
(request->'data'->>'note')::text)
returning pg_temp.data_watchlist_item.id INTO _idField;
return query SELECT * FROM pg_temp.view_watchlist_item_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;




    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_item_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_item_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text,"date_added" TIMESTAMP WITH TIME ZONE)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_item_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_item_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_item_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text,"date_added" TIMESTAMP WITH TIME ZONE)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_item_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;







    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_saved_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_saved_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"watchlist_id" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_saved_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_alert_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'alert','alert_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_block_list_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'block_list','block_list_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_block_list_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'block_list','block_list_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_block_list_insert('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'block_list','block_list_insert' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_bookmark_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'bookmark','bookmark_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_bookmark_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'bookmark','bookmark_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_comment_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'comment','comment_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_comment_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'comment','comment_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_comment_insert('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'comment','comment_insert' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_platform_claim_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'platform_claim','platform_claim_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_platform_claim_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'platform_claim','platform_claim_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_post_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'post','post_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_post_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'post','post_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscriber_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscriber','subscriber_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscriber_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscriber','subscriber_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscriber_insert('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscriber','subscriber_insert' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscriber_update('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscriber','subscriber_update' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscription_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscription','subscription_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscription_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscription','subscription_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscription_insert('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscription','subscription_insert' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_subscription_update('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'subscription','subscription_update' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_upvote_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'upvote','upvote_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_upvote_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'upvote','upvote_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_user_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'user','user_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_user_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'user','user_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_user_update('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'user','user_update' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist','watchlist_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist','watchlist_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_insert('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist','watchlist_insert' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_update('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist','watchlist_update' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_item_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist_item','watchlist_item_list' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_item_get('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist_item','watchlist_item_get' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_item_insert('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist_item','watchlist_item_insert' ,col_name,err, ctx, det ;
END;
$$;
DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_watchlist_saved_list('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'watchlist_saved','watchlist_saved_list' ,col_name,err, ctx, det ;
END;
$$;