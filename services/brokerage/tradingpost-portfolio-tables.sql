CREATE TABLE IF NOT EXISTS public.tradingpost_current_holdings
(
	id serial UNIQUE NOT null,
	account_id integer NOT null,
	security_id bigint NOT null,
	security_type text,
	price numeric(24,4) NOT null,
	price_as_of timestamp with time zone NOT null,
	price_source text NOT null,
	value numeric(24,4) NOT null,
	cost_basis numeric(24,4),
	quantity numeric(24,4) NOT null,
	currency text,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tradingpost_historical_holdings
(
	id serial UNIQUE NOT null,
	account_id integer NOT null,
	security_id bigint NOT null,
	security_type text,
	price numeric(24,4) NOT null,
	price_as_of timestamp with time zone NOT null,
	price_source text NOT null,
	value numeric(24,4) NOT null,
	cost_basis numeric(24,4),
	quantity numeric(24,4) NOT null,
	currency text,
	date timestamp with time zone NOT NULL,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tradingpost_custom_industry
(
	id serial UNIQUE NOT null,
	user_id text NOT null,
	security_id bigint NOT null,
	industry text NOT null,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tradingpost_transactions
(
	id serial UNIQUE NOT null,
	account_id integer NOT null,
	security_id bigint NOT null,
	security_type text,
	date timestamp with time zone NOT NULL,
	quantity numeric(24,4) NOT null,
	price numeric(24,4) NOT null,
	amount numeric(24,4) NOT null,
	fees numeric(24,4),
	type text NOT null,
	currency text,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tradingpost_brokerage_accounts
(
	id serial UNIQUE NOT null,
	user_id text NOT null,
	broker_name text NOT null,
	mask text,
	name text NOT null,
	official_name text,
	type text NOT null,
	subtype text,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tradingpost_account_groups
(
	id serial UNIQUE NOT null,
	user_id text NOT null,
	name text NOT null,
	account_group_id text NOT null,
	account_id text NOT null,
	default_benchmark_id bigint NOT null,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tradingpost_account_group_stats
(
	id serial UNIQUE NOT null,
	account_group_id text NOT null,
	beta numeric(24,4),
	sharpe numeric(24,4),
	industry_allocations JSONB,
	exposure JSONB,
	date timestamp with time zone NOT NULL,
	benchmark_id bigint,
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now(),
	UNIQUE (account_group_id, date)
);

CREATE TABLE IF NOT EXISTS public.benchmark_hprs
(
	id serial UNIQUE NOT null,
	security_id bigint NOT null,
	date timestamp with time zone NOT NULL,
	return numeric(24,4),
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now(),
	UNIQUE(security_id, date)
);

CREATE TABLE IF NOT EXISTS public.account_group_hprs
(
	id serial UNIQUE NOT null,
	account_group_id integer NOT null,
	date timestamp with time zone NOT NULL,
	return numeric(24,4),
	created_at timestamp with time zone NOT NULL DEFAULT now(),
	updated_at timestamp with time zone NOT NULL DEFAULT now(),
	UNIQUE (account_group_id, date)
);

