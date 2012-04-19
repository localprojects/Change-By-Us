alter table project__user add column is_project_creator tinyint(1) NOT NULL DEFAULT '0' after is_project_admin;
update project__user set is_project_creator = 1 where is_project_admin = 1;
