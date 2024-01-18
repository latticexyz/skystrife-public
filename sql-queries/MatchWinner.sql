-- Gives the address of the wallet that won each match
SELECT
    rankings.match_entity,
    CONCAT(
        '0x',
        ENCODE(SUBSTRING(owned_by.value, 13), 'hex')
    ) AS winner
FROM
    (
        -- Get most recent ranking
        WITH rankings AS (
            -- Get all ranking records, sorted by timestamp
            SELECT
                key,
                value,
                ROW_NUMBER() OVER (
                    PARTITION BY key
                    ORDER BY
                        __last_updated_block_number DESC
                ) AS RowNum
            FROM
                "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__".match_ranking
        )
        SELECT
            key as match_entity,
            DECODE(
                SUBSTRING(value :: json -> 'json' ->> 0, 3),
                'hex'
            ) AS winner
        FROM
            rankings
        WHERE
            RowNum = 1
        ORDER BY
            value DESC
    ) AS rankings
    INNER JOIN "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__".owned_by ON rankings.match_entity = "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__".owned_by.match_entity
    AND rankings.winner = "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__".owned_by.entity;