
    DROP FUNCTION IF EXISTS public.view_alert_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_alert_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"data" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."data", d."type", d."user_id" FROM public.data_alert as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_bookmark_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_bookmark_list(
        request jsonb)
        RETURNS TABLE("user_id" UUID,"post_id" text,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."user_id", d."post_id", d."id" FROM public.data_bookmark as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_bookmark_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_bookmark_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"post_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."post_id", d."user_id" FROM public.data_bookmark as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_comment_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_comment_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"related_type" text,"related_id" text,"comment" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."related_type", d."related_id", d."comment", d."user_id" FROM public.data_comment as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_comment_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_comment_get(
        request jsonb)
        RETURNS TABLE("comment" text,"id" BIGINT,"related_type" text,"related_id" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."comment", d."id", d."related_type", d."related_id", d."user_id" FROM public.data_comment as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_comment_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_comment_insert(
        request jsonb)
        RETURNS TABLE("related_type" text,"related_id" text,"comment" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."related_type", d."related_id", d."comment", d."user_id" FROM public.data_comment as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_platform_claim_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_platform_claim_list(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID,"platform_user_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."platform", d."claims", d."id", d."user_id", d."platform_user_id" FROM public.data_platform_claim as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_platform_claim_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_platform_claim_get(
        request jsonb)
        RETURNS TABLE("platform" text,"claims" json,"id" BIGINT,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."platform", d."claims", d."id", d."user_id" FROM public.data_platform_claim as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_upvote_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_upvote_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"post_id" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."user_id", d."post_id" FROM public.data_upvote as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_user_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_user_list(
        request jsonb)
        RETURNS TABLE("id" UUID,"handle" text,"tags" json,"display_name" text,"profile_url" text,"subscription" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."handle", d."tags", (concat(d."first_name",' ',d."last_name")) as "display_name", d."profile_url", (SELECT json_agg(a)->0 FROM  	(SELECT  "sub"."id", sub."cost", 		 (SELECT  count(*) FROM data_subscriber r where r."subscription_id" = "sub"."id" ) as "count",          exists(SELECT  * FROM data_subscriber r where r."subscription_id" = "sub"."id" and  r."user_id" = (request->>'user_id')::UUID ) as "is_subscribed" 		 FROM data_subscription as "sub" where "sub"."user_id" = d."id" 		 group by sub."id", sub."cost" 	) as a) as "subscription" FROM public.data_user as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscriber_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscriber_insert(
        request jsonb)
        RETURNS TABLE("subscription_id" bigint,"user_id" UUID,"start_date" TIMESTAMP WITH TIME ZONE)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."subscription_id", d."user_id", d."start_date" FROM public.data_subscriber as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscriber_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscriber_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"user_id" UUID,"start_date" TIMESTAMP WITH TIME ZONE)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_id", d."user_id", d."start_date" FROM public.data_subscriber as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscription_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscription_insert(
        request jsonb)
        RETURNS TABLE("name" text,"settings" json,"cost" money,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."name", d."settings", d."cost", d."user_id" FROM public.data_subscription as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscription_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscription_update(
        request jsonb)
        RETURNS TABLE("name" text,"settings" json,"id" BIGINT,"cost" money,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."name", d."settings", d."id", d."cost", d."user_id" FROM public.data_subscription as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_upvote_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_upvote_list(
        request jsonb)
        RETURNS TABLE("post_id" text,"user_id" UUID,"id" BIGINT)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."post_id", d."user_id", d."id" FROM public.data_upvote as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_user_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_user_update(
        request jsonb)
        RETURNS TABLE("id" UUID,"first_name" text,"last_name" text,"analyst_profile" json,"has_profile_pic" boolean,"profile_url" text,"settings" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."first_name", d."last_name", d."analyst_profile", d."has_profile_pic", d."profile_url", d."settings" FROM public.data_user as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_watchlist_item_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_watchlist_item_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."symbol", d."watchlist_id", d."note" FROM public.data_watchlist_item as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_watchlist_saved_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_watchlist_saved_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"watchlist_id" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."user_id", d."watchlist_id" FROM public.data_watchlist_saved as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_watchlist_item_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_watchlist_item_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"symbol" text,"watchlist_id" bigint,"note" text)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."symbol", d."watchlist_id", d."note" FROM public.data_watchlist_item as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_post_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_post_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"platform_post_url" text,"platform" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"subscription_level" text,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."platform_post_url", d."platform", d."body", (SELECT count(*) FROM public.view_upvote_get(request) as t WHERE t."post_id"=d."id") as "upvoted_count", EXISTS(SELECT * FROM public.view_upvote_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_upvoted", EXISTS(SELECT * FROM public.view_bookmark_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_bookmarked", d."subscription_level", (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM public.data_post as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_post_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_post_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_level" text,"platform" text,"platform_post_url" text,"body" json,"upvoted_count" bigint,"is_upvoted" boolean,"is_bookmarked" boolean,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_level", d."platform", d."platform_post_url", d."body", (SELECT count(*) FROM public.view_upvote_get(request) as t WHERE t."post_id"=d."id") as "upvoted_count", EXISTS(SELECT * FROM public.view_upvote_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_upvoted", EXISTS(SELECT * FROM public.view_bookmark_get(request) as t WHERE t.post_id=d."id" and t.user_id = (request->>'user_id')::UUID) as "is_bookmarked", (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM public.data_post as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscriber_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscriber_list(
        request jsonb)
        RETURNS TABLE("subscription_id" bigint,"user_id" UUID,"start_date" TIMESTAMP WITH TIME ZONE,"due_date" TIMESTAMP WITH TIME ZONE,"id" BIGINT,"subscription" json,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."subscription_id", d."user_id", d."start_date", d."due_date", d."id", (SELECT json_agg(t) FROM public.view_subscription_get(request) as t WHERE t.id=d."subscription_id") as "subscription", (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM public.data_subscriber as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscription_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscription_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"settings" json,"cost" money,"name" text,"user_id" UUID,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."settings", d."cost", d."name", d."user_id", (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM public.data_subscription as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscriber_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscriber_get(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"subscription_id" bigint,"start_date" TIMESTAMP WITH TIME ZONE,"user_id" UUID,"due_date" TIMESTAMP WITH TIME ZONE,"subscription" json,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."subscription_id", d."start_date", d."user_id", d."due_date", (SELECT json_agg(t) FROM public.view_subscription_get(request) as t WHERE t.id=d."subscription_id") as "subscription", (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM public.data_subscriber as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_subscription_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_subscription_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"user_id" UUID,"name" text,"cost" money,"user" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."user_id", d."name", d."cost", (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user" FROM public.data_subscription as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_user_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_user_get(
        request jsonb)
        RETURNS TABLE("handle" text,"email" text,"claims" json,"bio" text,"tags" json,"id" UUID,"display_name" text,"first_name" text,"last_name" text,"profile_url" text,"banner_url" text,"analyst_profile" json,"subscription" json,"settings" json)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."handle", CASE WHEN d.id = (request->>'user_id')::UUID THEN d."email" END as "email", (SELECT json_agg(t) FROM public.view_platform_claim_list(request) as t WHERE t.user_id=d."id") as "claims", d."bio", d."tags", d."id", (concat(d."first_name",' ',d."last_name")) as "display_name", d."first_name", d."last_name", d."profile_url", d."banner_url", d."analyst_profile", (SELECT json_agg(a)->0 FROM  	(SELECT  "sub"."id", sub."cost", 		 (SELECT  count(*) FROM data_subscriber r where r."subscription_id" = "sub"."id" ) as "count",          exists(SELECT  * FROM data_subscriber r where r."subscription_id" = "sub"."id" and  r."user_id" = (request->>'user_id')::UUID ) as "is_subscribed" 		 FROM data_subscription as "sub" where "sub"."user_id" = d."id" 		 group by sub."id", sub."cost" 	) as a) as "subscription", d."settings" FROM public.data_user as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_watchlist_list(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_watchlist_list(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"user" json,"type" text,"user_id" UUID,"item_count" bigint,"saved_by_count" bigint)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."name", d."note", (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user", d."type", d."user_id", (SELECT count(*) FROM public.view_watchlist_item_list(request) as t WHERE t."watchlist_id"=d."id") as "item_count", (SELECT count(*) FROM public.view_watchlist_saved_list(request) as t WHERE t."watchlist_id"=d."id") as "saved_by_count" FROM public.data_watchlist as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_watchlist_get(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_watchlist_get(
        request jsonb)
        RETURNS TABLE("user" json,"items" json,"note" text,"name" text,"id" BIGINT,"type" text,"saved_by_count" bigint,"is_saved" boolean)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT (SELECT json_agg(t) FROM public.view_user_list(request) as t WHERE t.id=d."user_id") as "user", (SELECT json_agg(t) FROM public.view_watchlist_item_list(request) as t WHERE t.watchlist_id=d."id") as "items", d."note", d."name", d."id", d."type", (SELECT count(*) FROM public.view_watchlist_saved_list(request) as t WHERE t."watchlist_id"=d."id") as "saved_by_count", EXISTS(SELECT * FROM public.view_watchlist_saved_list(request) as t WHERE t.watchlist_id=d."id") as "is_saved" FROM public.data_watchlist as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_watchlist_insert(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_watchlist_insert(
        request jsonb)
        RETURNS TABLE("name" text,"note" text,"items" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."name", d."note", (SELECT json_agg(t) FROM public.view_watchlist_item_list(request) as t WHERE t.watchlist_id=d."id") as "items", d."type", d."user_id" FROM public.data_watchlist as d;
    END;
    $BODY$;


    DROP FUNCTION IF EXISTS public.view_watchlist_update(jsonb);
  
    CREATE OR REPLACE FUNCTION public.view_watchlist_update(
        request jsonb)
        RETURNS TABLE("id" BIGINT,"name" text,"note" text,"items" json,"type" text,"user_id" UUID)
        LANGUAGE 'plpgsql'
    AS $BODY$
    
    BEGIN
  RETURN QUERY SELECT d."id", d."name", d."note", (SELECT json_agg(t) FROM public.view_watchlist_item_list(request) as t WHERE t.watchlist_id=d."id") as "items", d."type", d."user_id" FROM public.data_watchlist as d;
    END;
    $BODY$;