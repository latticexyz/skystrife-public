-- Gives the number of orbs currently owned by each wallet
WITH OrbBalances AS (
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
    concat('0x', encode(account, 'hex')) AS account,
    (value / 1e18) AS balance
FROM
    OrbBalances
WHERE
    RowNum = 1
    AND value <> 0
ORDER BY
    value DESC;