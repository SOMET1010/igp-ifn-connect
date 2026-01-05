-- Lier les membres aux coopératives via le nom
UPDATE vivriers_members vm
SET cooperative_id = vc.id
FROM vivriers_cooperatives vc
WHERE vm.cooperative_name = vc.name
AND vm.cooperative_id IS NULL;