SET
    search_path TO "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377__";

-- Gives the number of matches joined for each owner
SELECT
    concat(
        '0x',
        encode(SUBSTRING(owned_by.value, 13), 'hex')
    ) AS account,
    COUNT(*) AS matches_joined
FROM
    spawn_reserved_by
    INNER JOIN owned_by ON spawn_reserved_by.match_entity = owned_by.match_entity
    AND spawn_reserved_by.value = owned_by.entity
GROUP BY
    owned_by.value
ORDER BY
    matches_joined DESC;