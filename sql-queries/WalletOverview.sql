-- Gives the account, orb balance, season pass holder, matches joined, and matches won
WITH orb_balances AS (
    -- Get each accounts most recent orb balance
    WITH orb_balances AS (
        SELECT
            account,
            value,
            ROW_NUMBER() OVER (
                PARTITION BY account
                ORDER BY
                    __last_updated_block_number DESC
            ) AS RowNum
        FROM
            "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__Orb".balances
    )
    SELECT
        account,
        value
    FROM
        orb_balances
    WHERE
        RowNum = 1
        AND value <> 0
),
matches_joined AS (
    -- Get the number of matches joined by each account
    SELECT
        SUBSTRING(owned_by.value, 13) AS account,
        COUNT(*) AS matches_joined
    FROM
        spawn_reserved_by
        INNER JOIN owned_by ON spawn_reserved_by.match_entity = owned_by.match_entity
        AND spawn_reserved_by.value = owned_by.entity
    GROUP BY
        owned_by.value
),
matches_won AS (
    -- Get the number of matches won by each account
    SELECT
        SUBSTRING(winner, 13) as account,
        COUNT(*) as matches_won
    FROM
        (
            SELECT
                rankings.match_entity,
                owned_by.value AS winner
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
                ) AS rankings
                INNER JOIN owned_by ON rankings.match_entity = owned_by.match_entity
                AND rankings.winner = owned_by.entity
        ) AS matches_won
    GROUP BY
        winner
)
SELECT
    concat(
        '0x',
        encode(
            COALESCE(
                orb_balances.account,
                season_pass_balances.account,
                matches_joined.account,
                matches_won.account
            ),
            'hex'
        )
    ) AS "account",
    COALESCE(orb_balances.value, 0) / 1e18 AS orb_balance,
    COALESCE(season_pass_balances.value IS NOT NULL, FALSE) AS season_pass_holder,
    COALESCE(matches_joined.matches_joined, 0) as matches_joined,
    COALESCE(matches_won.matches_won, 0) as matches_won
FROM
    "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__SeasonPass".balances AS season_pass_balances FULL
    OUTER JOIN orb_balances ON orb_balances.account = season_pass_balances.account FULL
    OUTER JOIN matches_joined ON matches_joined.account = COALESCE(
        orb_balances.account,
        season_pass_balances.account
    ) FULL
    OUTER JOIN matches_won ON matches_won.account = COALESCE(
        orb_balances.account,
        season_pass_balances.account,
        matches_joined.account
    )
ORDER BY
    COALESCE(orb_balances.value, 0) DESC;