DROP TABLE IF EXISTS errors;CREATE TEMP TABLE errors (type TEXT,entityName TEXT, name TEXT,columnname text, message TEXT, context TEXT, detail TEXT);
ALTER TABLE data_alert
ADD PRIMARY KEY(id)
ALTER TABLE data_bookmark
ADD PRIMARY KEY(id)
ALTER TABLE data_comment
ADD PRIMARY KEY(id)
ALTER TABLE data_platform_claim
ADD PRIMARY KEY(id)
ALTER TABLE data_post
ALTER COLUMN platform_created_at TYPE TIMESTAMP WITH TIME ZONE,
ADD PRIMARY KEY(id)
ALTER TABLE data_subscriber
ALTER COLUMN start_date TYPE TIMESTAMP WITH TIME ZONE,
ALTER COLUMN due_date TYPE TIMESTAMP WITH TIME ZONE
ALTER TABLE data_upvote
ADD PRIMARY KEY(id)
/* No changes to data_user */
ALTER TABLE data_watchlist
ALTER COLUMN user_id  SET NOT NULL,
ALTER COLUMN type  SET NOT NULL,
ALTER COLUMN name  SET NOT NULL
ALTER TABLE data_watchlist_item
ALTER COLUMN watchlist_id  SET NOT NULL,
ALTER COLUMN symbol  SET NOT NULL

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

    DROP FUNCTION IF EXISTS pg_temp.view_bookmark_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_bookmark_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"post_id" bigint,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."post_id", d."user_id" FROM pg_temp.data_bookmark as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_comment_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_comment_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"related_type" text,"related_id" text,"comment" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."related_type", d."related_id", d."comment" FROM pg_temp.data_comment as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_comment_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_comment_get(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."comment", d."id", d."related_type", d."related_id" FROM pg_temp.data_comment as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_platform_claim_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_platform_claim_list(
        request jsonb)
        RETURNS TABLE("platform" text,"handle" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."platform", d."handle", d."claims", d."id", d."user_id" FROM pg_temp.data_platform_claim as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_platform_claim_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_platform_claim_get(
        request jsonb)
        RETURNS TABLE("platform" text,"handle" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."platform", d."handle", d."claims", d."id", d."user_id" FROM pg_temp.data_platform_claim as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_upvote_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_upvote_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"post_id" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."user_id", d."post_id" FROM pg_temp.data_upvote as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_user_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_user_list(
        request jsonb)
        RETURNS TABLE("id" UUID,"handle" text,"tags" json,"display_name" text,"profile_url" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."handle", d."tags", (concat(d."first_name",' ',d."last_name")) as "display_name", d."profile_url" FROM pg_temp.data_user as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscriber_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscriber_list(
        request jsonb)
        RETURNS TABLE("subscription_id" bigint,"user_id" UUID,"start_date" timestamptz,"due_date" timestamptz,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."subscription_id", d."user_id", d."start_date", d."due_date", d."id" FROM pg_temp.data_subscriber as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_subscriber_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_subscriber_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" timestamptz,"user_id" UUID,"due_date" timestamptz)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_id", d."start_date", d."user_id", d."due_date" FROM pg_temp.data_subscriber as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_item_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_item_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."symbol", d."watchlist_id", d."note" FROM pg_temp.data_watchlist_item as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_item_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_item_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."symbol", d."watchlist_id", d."note" FROM pg_temp.data_watchlist_item as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_post_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_post_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"platform_post_url" text,"platform" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"subscription_level" text,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."platform_post_url", d."platform", d."body", (SELECT count(*) FROM pg_temp.view_upvote_get(request) as t WHERE t."post_id"=d."id") as "upvoted_count", EXISTS(SELECT * FROM pg_temp.view_upvote_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_upvoted", EXISTS(SELECT * FROM pg_temp.view_bookmark_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_bookmarked", d."subscription_level", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM pg_temp.data_post as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_post_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_post_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_level" text,"platform" text,"platform_post_url" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_level", d."platform", d."platform_post_url", d."body", (SELECT count(*) FROM pg_temp.view_upvote_get(request) as t WHERE t."post_id"=d."id") as "upvoted_count", EXISTS(SELECT * FROM pg_temp.view_upvote_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_upvoted", EXISTS(SELECT * FROM pg_temp.view_bookmark_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_bookmarked", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM pg_temp.data_post as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_user_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_user_get(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."handle", CASE WHEN d.id = (request->>'user_id')::UUID THEN d."email" END as "email", (SELECT json_agg(t) FROM pg_temp.view_platform_claim_list(request) as t WHERE t.user_id=d."id") as "claims", d."bio", d."tags", d."id", (concat(d."first_name",' ',d."last_name")) as "display_name", d."first_name", d."last_name", d."profile_url", d."banner_url" FROM pg_temp.data_user as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"item_count" text,"user" json,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."name", d."note", (SELECT count(*) FROM pg_temp.view_watchlist_item_list(request) as t WHERE t."watchlist_id"=d."id") as "item_count", (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", d."type" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_get(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT (SELECT json_agg(t) FROM pg_temp.view_user_list(request) as t WHERE t.id=d."user_id") as "user", (SELECT json_agg(t) FROM pg_temp.view_watchlist_item_list(request) as t WHERE t.watchlist_id=d."id") as "items", d."note", d."name", d."id", d."type" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_insert(
        request jsonb)
        RETURNS TABLE("name" text,"note" text,"items" json,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."name", d."note", (SELECT json_agg(t) FROM pg_temp.view_watchlist_item_list(request) as t WHERE t.watchlist_id=d."id") as "items", d."type" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.view_watchlist_update(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.view_watchlist_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"items" json,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."name", d."note", (SELECT json_agg(t) FROM pg_temp.view_watchlist_item_list(request) as t WHERE t.watchlist_id=d."id") as "items", d."type" FROM pg_temp.data_watchlist as d;
    END;
    $BODY$;







    DROP FUNCTION IF EXISTS pg_temp.api_alert_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_alert_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"data" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_alert_list(request) as v ;
    END;
    $BODY$;





    DROP FUNCTION IF EXISTS pg_temp.api_bookmark_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_bookmark_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"post_id" bigint,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_bookmark_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;







    DROP FUNCTION IF EXISTS pg_temp.api_comment_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_comment_get(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_comment_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_comment_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_comment_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"related_type" text,"related_id" text,"comment" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_comment_list(request) as v ;
    END;
    $BODY$;





    DROP FUNCTION IF EXISTS pg_temp.api_platform_claim_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_platform_claim_get(
        request jsonb)
        RETURNS TABLE("platform" text,"handle" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_platform_claim_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_platform_claim_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_platform_claim_list(
        request jsonb)
        RETURNS TABLE("platform" text,"handle" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_platform_claim_list(request) as v ;
    END;
    $BODY$;





    DROP FUNCTION IF EXISTS pg_temp.api_post_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_post_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_level" text,"platform" text,"platform_post_url" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_post_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_post_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_post_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"platform_post_url" text,"platform" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"subscription_level" text,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_post_list(request) as v WHERE v.subscription_level=(request->'data'->>'subscription_level')::text;
    END;
    $BODY$;







    DROP FUNCTION IF EXISTS pg_temp.api_subscriber_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_subscriber_list(
        request jsonb)
        RETURNS TABLE("subscription_id" bigint,"user_id" UUID,"start_date" timestamptz,"due_date" timestamptz,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_subscriber_list(request) as v ;
    END;
    $BODY$;





    DROP FUNCTION IF EXISTS pg_temp.api_upvote_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_upvote_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"post_id" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_upvote_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;







    DROP FUNCTION IF EXISTS pg_temp.api_user_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_user_get(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_user_get(request) as v WHERE v."id" = (request->'data'->>'id')::UUID;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_user_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_user_list(
        request jsonb)
        RETURNS TABLE("id" UUID,"handle" text,"tags" json,"display_name" text,"profile_url" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_user_list(request) as v ;
    END;
    $BODY$;

    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_insert(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO pg_temp.data_watchlist(
  name,
note,
type)
VALUES ((request->'data'->>'name')::text,
(request->'data'->>'note')::text,
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
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE pg_temp.data_watchlist SET name =  tp.prop_or_default(request->data ,'name',name), 
note =  tp.prop_or_default(request->data ,'note',note), 
type =  tp.prop_or_default(request->data ,'type',type) WHERE v."id" = (request->'data'->>'id')::BIGINT;
DELETE FROM pg_temp.data_watchlist_item t WHERE t.watchlist_id = _idField;
IF request->'data' ? 'items' THEN
INSERT INTO pg_temp.data_watchlist_item(watchlist_id,symbol,note)
SELECT _idField,(value->>'symbol')::text,(value->>'note')::text FROM json_array_elements((request->'data'->>'items')::json);
END IF;
return query SELECT * FROM pg_temp.view_watchlist_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_get(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"item_count" text,"user" json,"type" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_list(request) as v ;
    END;
    $BODY$;





    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_item_get(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_item_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_item_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS pg_temp.api_watchlist_item_list(jsonb);
  
    CREATE OR REPLACE FUNCTION pg_temp.api_watchlist_item_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM pg_temp.view_watchlist_item_list(request) as v ;
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