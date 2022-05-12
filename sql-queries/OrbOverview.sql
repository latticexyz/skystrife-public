WITH match_ranking_index AS (
    --Get most recent ranking record for each match
    WITH match_ranking_ordered AS (
        --Sort the match ranking records by block number
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
        match_ranking_ordered.key,
        decode(
            SUBSTRING(
                json_data.value,
                3,
                64
            ),
            'hex'
        ) AS player,
        json_data.index - 1 AS rank
    FROM
        match_ranking_ordered,
        LATERAL (
            SELECT
                value,
                ROW_NUMBER() OVER () AS index
            FROM
                json_array_elements_text(match_ranking_ordered.value :: json -> 'json')
        ) AS json_data
    WHERE
        RowNum = 1
),
match_rewards_index AS (
    --Get the fee reward percentages for each rank
    SELECT
        match_sweepstake.key,
        json_data.index - 1 AS rank,
        json_data.value :: DECIMAL as reward_percentage
    FROM
        match_sweepstake,
        LATERAL (
            SELECT
                value,
                ROW_NUMBER() OVER () AS index
            FROM
                json_array_elements_text(
                    match_sweepstake.reward_percentages :: json -> 'json'
                )
        ) AS json_data
),
number_of_players AS (
    --Get the number of players in each match
    SELECT
        entity AS match_entity,
        COUNT(*) AS count
    FROM
        match_reward
    GROUP BY
        entity
)
SELECT
    concat('0x', encode(match_finished.key, 'hex')) AS match_entity,
    match_reward.rank,
    concat(
        '0x',
        encode(SUBSTRING(owned_by.value, 13), 'hex')
    ) AS recipient,
    match_reward.value / 1e18 as play_reward,
    (
        (
            match_rewards_index.reward_percentage * number_of_players.count
        ) * match_sweepstake.entrance_fee
    ) / 1e20 AS fees_reward
FROM
    match_finished
    INNER JOIN match_reward ON match_finished.key = match_reward.entity
    INNER JOIN match_sweepstake ON match_finished.key = match_sweepstake.key
    INNER JOIN number_of_players ON match_finished.key = number_of_players.match_entity
    INNER JOIN match_ranking_index ON match_reward.entity = match_ranking_index.key
    and match_reward.rank = match_ranking_index.rank
    INNER JOIN match_rewards_index ON match_finished.key = match_rewards_index.key
    and match_ranking_index.rank = match_rewards_index.rank
    INNER JOIN owned_by ON match_ranking_index.key = owned_by.match_entity
    and match_ranking_index.player = owned_by.entity
ORDER BY
    match_finished.key,
    match_reward.rank;