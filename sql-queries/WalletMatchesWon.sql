-- Gives the address of the wallet that won each match
SELECT
    SUBSTRING(winner, 13) as account,
    COUNT(*) as matches_won
FROM
    (
        SELECT
            rankings.match_entity,
            CONCAT(
                '0x',
                ENCODE(SUBSTRING(owned_by.value, 13), 'hex')
            ) AS winner
        FROM
            (
                WITH rankings AS (
                    SELECT
                        key,
                        value,
                        ROW_NUMBER() OVER (
                            PARTITION BY key
                            ORDER BY
                                __last_updated_block_number DESC
                        ) AS RowNum
                    FROM
                        match_ranking
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
            ) AS rankings
            INNER JOIN owned_by ON rankings.match_entity = owned_by.match_entity
            AND rankings.winner = owned_by.entity
    ) AS rankings
GROUP BY
    winner;