-- Table creation script
CREATE TABLE users (
    email character varying(100) NOT NULL,
    id bigserial NOT NULL,
    hash character varying(72) NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT unique_email UNIQUE (email)
)