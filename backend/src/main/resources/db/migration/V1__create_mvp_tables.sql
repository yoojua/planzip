CREATE TABLE members (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_members PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE local_credentials (
    member_id BIGINT NOT NULL,
    normalized_email VARCHAR(254) COLLATE utf8mb4_bin NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT pk_local_credentials PRIMARY KEY (member_id),
    CONSTRAINT uk_local_credentials_email UNIQUE (normalized_email),
    CONSTRAINT fk_local_credentials_member FOREIGN KEY (member_id)
        REFERENCES members (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE plans (
    id BIGINT NOT NULL AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'BUCKET_LIST',
    title VARCHAR(50) NOT NULL DEFAULT '나의 버킷리스트',
    visibility VARCHAR(10) NOT NULL DEFAULT 'PRIVATE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_plans PRIMARY KEY (id),
    CONSTRAINT uk_plans_owner UNIQUE (owner_id),
    CONSTRAINT fk_plans_owner FOREIGN KEY (owner_id)
        REFERENCES members (id),
    CONSTRAINT ck_plans_visibility CHECK (visibility IN ('PRIVATE', 'PUBLIC'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE bucket_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    plan_id BIGINT NOT NULL,
    content VARCHAR(200) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    position INT NOT NULL,
    CONSTRAINT pk_bucket_items PRIMARY KEY (id),
    CONSTRAINT fk_bucket_items_plan FOREIGN KEY (plan_id)
        REFERENCES plans (id) ON DELETE CASCADE,
    CONSTRAINT ck_bucket_items_position CHECK (position >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
