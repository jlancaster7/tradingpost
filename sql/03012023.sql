CREATE TABLE tradingpost_institution_security_translation
(
    id             BIGSERIAL   NOT NULL,
    from_symbol    TEXT        NOT NULL,
    to_symbol      TEXT        NOT NULL,
    currency       TEXT        NOT NULL,
    institution_id BIGINT,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

INSERT INTO tradingpost_institution_security_translation(from_symbol, to_symbol, currency, institution_id)
VALUES ('BRKB', 'BRK.B', 'USD', 6350);

INSERT INTO tradingpost_institution_security_translation(from_symbol, to_symbol, currency, institution_id)
VALUES ('IIAXX', 'USD:CUR', 'USD', null);

INSERT INTO tradingpost_institution_security_translation(from_symbol, to_symbol, currency, institution_id)
VALUES ('FCASH**', 'USD:CUR', 'USD', 6350);

INSERT INTO tradingpost_institution_security_translation(from_symbol, to_symbol, currency, institution_id)
VALUES ('CORE**', 'USD:CUR', 'USD', 6350);

INSERT INTO tradingpost_institution_security_translation(from_symbol, to_symbol, currency, institution_id)
VALUES ('SPAXX**', 'USD:CUR', 'USD', 6350);
