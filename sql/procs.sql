delimiter //

create procedure p_create_user(in user_key varchar(10)
                            ,in email varchar(100)
                            ,in password varchar(255)
                            ,in salt varchar(255)
                            ,in phone varchar(10)
                            ,in first_name varchar(50)
                            ,in last_name varchar(50)
                            ,in image_id int
                            ,in location_id int)
begin
  insert into user (user_key
    ,email
    ,password
    ,salt
    ,phone
    ,first_name
    ,last_name
    ,image_id
    ,location_id
    ,created_datetime
  values (user_key
    ,email
    ,password
    ,salt
    ,phone
    ,first_name
    ,last_name
    ,image_id
    ,location_id
    ,now());
end$$

create procedure p_add_user_to_user_group(in user_id int, 
                                    ,in user_group_id int)
begin
    insert into user__user_group (user_id, user_group_id) values (user_id, user_group_id);

end$$
