CREATE DATABASE bank;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    passwd VARCHAR(255) NOT NULL
);

CREATE TABLE account(
    account_id SERIAL PRIMARY KEY,
    balance FLOAT NOT NULL,
    account_number INT UNIQUE,
    routing_number INT UNIQUE,
    type_account INT
);

CREATE TABLE credit_card(
    credit_card_id SERIAL PRIMARY KEY,
    credit_card_num INT NOT NULL UNIQUE,
    debt FLOAT NOT NULL,
    type_credit_card INT NOT NULL
);


CREATE TABLE joint(
    joint_id SERIAL PRIMARY KEY,
    user_id_FK INT REFERENCES users(user_id),
    account_id_FK INT REFERENCES account(account_id),
    credit_card_id_FK INT REFERENCES credit_card(credit_card_id)
);

