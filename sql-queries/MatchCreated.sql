--Matches are "created" when MatchConfig is set
SELECT
    __last_updated_block_number AS created_at_block,
    created_by AS main_wallet_address,
    encode(level_id, 'escape') AS map,
    key AS match_Entity
FROM
    "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__".match_config;