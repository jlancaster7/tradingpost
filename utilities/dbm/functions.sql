






    DROP FUNCTION IF EXISTS public.api_alert_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_alert_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"data" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_alert_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;






    DROP FUNCTION IF EXISTS public.api_bookmark_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_bookmark_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"post_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_bookmark_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_bookmark_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_bookmark_list(
        request jsonb)
        RETURNS TABLE("user_id" UUID,"post_id" text,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_bookmark_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_comment_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_comment_insert(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO public.data_comment(
  related_type,
related_id,
comment,
user_id)
VALUES ((request->'data'->>'related_type')::text,
(request->'data'->>'related_id')::text,
(request->'data'->>'comment')::text,
(request->>'user_id')::UUID)
returning public.data_comment.id INTO _idField;
return query SELECT * FROM public.view_comment_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;




    DROP FUNCTION IF EXISTS public.api_comment_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_comment_get(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_comment_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_comment_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_comment_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"related_type" text,"related_id" text,"comment" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_comment_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;






    DROP FUNCTION IF EXISTS public.api_platform_claim_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_platform_claim_get(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_platform_claim_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_platform_claim_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_platform_claim_list(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID,"platform_user_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_platform_claim_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;






    DROP FUNCTION IF EXISTS public.api_post_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_post_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_level" text,"platform" text,"platform_post_url" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_post_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_post_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_post_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"platform_post_url" text,"platform" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"subscription_level" text,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_post_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscriber_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscriber_insert(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO public.data_subscriber(
  subscription_id,
user_id,
start_date,
approved)
VALUES ((request->'data'->>'subscription_id')::bigint,
(request->>'user_id')::UUID,
(request->'data'->>'start_date')::timestamptz,
(request->'data'->>'approved')::boolean)
returning public.data_subscriber.id INTO _idField;
return query SELECT * FROM public.view_subscriber_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscriber_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscriber_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE public.data_subscriber v SET subscription_id =  tp.prop_or_default(request->'data' ,'subscription_id',v.subscription_id), 
user_id= (request->>'user_id')::UUID, 
start_date =  tp.prop_or_default(request->'data' ,'start_date',v.start_date), 
approved =  tp.prop_or_default(request->'data' ,'approved',v.approved) WHERE v."id" = (request->'data'->>'id')::BIGINT;
return query SELECT * FROM public.view_subscriber_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscriber_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscriber_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_subscriber_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscriber_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscriber_list(
        request jsonb)
        RETURNS TABLE("subscription_id" bigint,"user_id" UUID,"start_date" TIMESTAMP WITH TIME ZONE,"due_date" TIMESTAMP WITH TIME ZONE,"id" BIGINT,"subscription" json,"user" json,"approved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_subscriber_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscription_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscription_insert(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO public.data_subscription(
  user_id,
name,
cost,
settings)
VALUES ((request->>'user_id')::UUID,
(request->'data'->>'name')::text,
(request->'data'->>'cost')::money,
(request->'data'->>'settings')::json)
returning public.data_subscription.id INTO _idField;
return query SELECT * FROM public.view_subscription_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscription_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscription_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE public.data_subscription v SET user_id= (request->>'user_id')::UUID, 
name =  tp.prop_or_default(request->'data' ,'name',v.name), 
cost =  tp.prop_or_default(request->'data' ,'cost',v.cost), 
settings =  tp.prop_or_default(request->'data' ,'settings',v.settings) WHERE v."id" = (request->'data'->>'id')::BIGINT;
return query SELECT * FROM public.view_subscription_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscription_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscription_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_subscription_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_subscription_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_subscription_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"name" text,"cost" money,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_subscription_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;














    DROP FUNCTION IF EXISTS public.api_upvote_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_upvote_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"post_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_upvote_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_upvote_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_upvote_list(
        request jsonb)
        RETURNS TABLE("post_id" text,"user_id" UUID,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_upvote_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;




    DROP FUNCTION IF EXISTS public.api_user_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_user_update(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text,"analyst_profile" json,"subscription" json,"settings" json,"social_analytics" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE public.data_user v SET first_name =  tp.prop_or_default(request->'data' ,'first_name',v.first_name), 
last_name =  tp.prop_or_default(request->'data' ,'last_name',v.last_name), 
profile_url =  tp.prop_or_default(request->'data' ,'profile_url',v.profile_url), 
settings =  tp.prop_or_default(request->'data' ,'settings',v.settings), 
bio =  tp.prop_or_default(request->'data' ,'bio',v.bio), 
banner_url =  tp.prop_or_default(request->'data' ,'banner_url',v.banner_url), 
analyst_profile =  tp.prop_or_default(request->'data' ,'analyst_profile',v.analyst_profile), 
has_profile_pic =  tp.prop_or_default(request->'data' ,'has_profile_pic',v.has_profile_pic), 
social_analytics =  tp.prop_or_default(request->'data' ,'social_analytics',v.social_analytics) WHERE v."id" = (request->'data'->>'id')::UUID;
return query SELECT * FROM public.view_user_get(request) as v WHERE v."id" = (request->'data'->>'id')::UUID;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_user_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_user_get(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text,"analyst_profile" json,"subscription" json,"settings" json,"social_analytics" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_user_get(request) as v WHERE v."id" = (request->'data'->>'id')::UUID;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_user_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_user_list(
        request jsonb)
        RETURNS TABLE("id" UUID,"handle" text,"tags" json,"display_name" text,"profile_url" text,"subscription" json,"social_analytics" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_user_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::UUID from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_watchlist_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_watchlist_insert(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    DECLARE
_idField BIGINT;
    BEGIN
  INSERT INTO public.data_watchlist(
  name,
note,
user_id,
type)
VALUES ((request->'data'->>'name')::text,
(request->'data'->>'note')::text,
(request->>'user_id')::UUID,
(request->'data'->>'type')::text)
returning public.data_watchlist.id INTO _idField;
DELETE FROM public.data_watchlist_item t WHERE t.watchlist_id = _idField;
IF request->'data' ? 'items' THEN
INSERT INTO public.data_watchlist_item(watchlist_id,symbol,note)
SELECT _idField,(value->>'symbol')::text,(value->>'note')::text FROM json_array_elements((request->'data'->>'items')::json);
END IF;
return query SELECT * FROM public.view_watchlist_get(request) as v WHERE v.id = _idField;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_watchlist_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_watchlist_update(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  UPDATE public.data_watchlist v SET name =  tp.prop_or_default(request->'data' ,'name',v.name), 
note =  tp.prop_or_default(request->'data' ,'note',v.note), 
user_id =  tp.prop_or_default(request->'data' ,'user_id',v.user_id), 
type =  tp.prop_or_default(request->'data' ,'type',v.type) WHERE v."id" = (request->'data'->>'id')::BIGINT;
DELETE FROM public.data_watchlist_item t WHERE t.watchlist_id = (request->'data'->>'id')::BIGINT;
IF request->'data' ? 'items' THEN
INSERT INTO public.data_watchlist_item(watchlist_id,symbol,note)
SELECT (request->'data'->>'id')::BIGINT,(value->>'symbol')::text,(value->>'note')::text FROM json_array_elements((request->'data'->>'items')::json);
END IF;
return query SELECT * FROM public.view_watchlist_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_watchlist_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_watchlist_get(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_watchlist_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_watchlist_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_watchlist_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"user" json,"type" text,"user_id" UUID,"item_count" bigint,"saved_by_count" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_watchlist_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;






    DROP FUNCTION IF EXISTS public.api_watchlist_item_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_watchlist_item_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_watchlist_item_get(request) as v WHERE v."id" = (request->'data'->>'id')::BIGINT;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.api_watchlist_item_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_watchlist_item_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_watchlist_item_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;








    DROP FUNCTION IF EXISTS public.api_watchlist_saved_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.api_watchlist_saved_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"watchlist_id" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  return query SELECT * FROM public.view_watchlist_saved_list(request) as v WHERE CASE WHEN  request->'data' ? 'ids' THEN  v.id in (SELECT value::BIGINT from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end;
    END;
    $BODY$;