CREATE TABLE IF NOT EXISTS voter (
    id BIGSERIAL PRIMARY KEY,
    voter_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    mobile_no VARCHAR(15),
    date_of_birth VARCHAR(20),
    has_voted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS vote_block (
    block_id BIGSERIAL PRIMARY KEY,
    block_hash VARCHAR(255),
    previous_hash VARCHAR(255),
    timestamp BIGINT,
    nonce INT
);

CREATE TABLE IF NOT EXISTS vote_block_candidate_ids (
    vote_block_block_id BIGINT REFERENCES vote_block(block_id),
    candidate_ids INT
);

CREATE TABLE IF NOT EXISTS vote_block_voter_hashes (
    vote_block_block_id BIGINT REFERENCES vote_block(block_id),
    voter_hashes VARCHAR(255)
);
