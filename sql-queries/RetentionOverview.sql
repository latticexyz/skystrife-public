-- Get the most up to date match details, including creator and timestamp
WITH Matches as (
    SELECT
        key,
        start_time,
        created_by,
        ROW_NUMBER() OVER (
            PARTITION BY key
            ORDER BY
                __last_updated_block_number DESC
        ) AS RowNum
    FROM
        match_config
),
players AS (
    SELECT
        match_entity,
        jsonb_agg(
            jsonb_build_object(
                'player',
                player,
                'season_pass_holder',
                season_pass_holder
            )
        ) AS players
    FROM
        (
            --Get the season pass balance of each external wallet
            SELECT
                match_entity,
                CONCAT(
                    '0x',
                    ENCODE(player, 'hex')
                ) AS player,
                COALESCE(season_pass_balances.value IS NOT NULL, FALSE) as season_pass_holder
            FROM
                (
                    -- Get the external wallet of each match player
                    SELECT
                        rankings.match_entity,
                        SUBSTRING(owned_by.value, 13) AS player
                    FROM
                        (
                            -- Get the most recent match ranking records
                            SELECT
                                key as match_entity,
                                decode(
                                    SUBSTRING(
                                        json_array_elements(value :: json -> 'json') :: text,
                                        4,
                                        64
                                    ),
                                    'hex'
                                ) as player
                            FROM
                                (
                                    -- Get every match ranking record, sorted by timestamp
                                    SELECT
                                        key,
                                        value,
                                        ROW_NUMBER() OVER (
                                            PARTITION BY key
                                            ORDER BY
                                                __last_updated_block_number DESC
                                        )
                                    FROM
                                        match_ranking
                                ) AS rankings_ordered_by_block
                            WHERE
                                row_number = 1
                        ) as rankings
                        INNER JOIN owned_by ON rankings.match_entity = owned_by.match_entity
                        AND rankings.player = owned_by.entity
                ) AS match_players
                LEFT JOIN "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__SeasonPass".balances AS season_pass_balances ON season_pass_balances.account = match_players.player
        ) AS match_players_and_balances
    GROUP BY
        match_entity
)
SELECT
    concat('0x', encode(Matches.key, 'hex')) AS match_entity,
    Matches.start_time AS timestamp,
    concat(
        '0x',
        encode(SUBSTRING(Matches.created_by, 13), 'hex')
    ) AS creator,
    (entrance_fee / 1e18) as match_fee,
    Players.players
FROM
    Matches
    INNER JOIN Match_Sweepstake ON Match_Sweepstake.key = Matches.key
    INNER JOIN Players ON Players.match_entity = Matches.key
WHERE
    Matches.RowNum = 1;