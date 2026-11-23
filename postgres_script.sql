-- =========================================================================
-- 1. ОЧИСТКА СТАРЫХ ТАБЛИЦ
-- =========================================================================
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS persons CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS coordinates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================================================
-- 2. СОЗДАНИЕ ТАБЛИЦ
-- =========================================================================

-- Пользователи (User)
CREATE TABLE users (
                       id            SERIAL PRIMARY KEY,
                       username      VARCHAR(255) NOT NULL UNIQUE CHECK (LENGTH(TRIM(username)) > 0),
                       password_hash VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(password_hash)) > 0)
);

-- Координаты (Coordinates)
CREATE TABLE coordinates (
                             id SERIAL PRIMARY KEY,
                             x  DOUBLE PRECISION NOT NULL,
                             y  INTEGER          NOT NULL
);

-- Локации (Location)
CREATE TABLE locations (
                           id SERIAL PRIMARY KEY,
                           x  BIGINT  NOT NULL,
                           y  INTEGER NOT NULL,
                           z  INTEGER NOT NULL
);

-- Адреса (Address)
CREATE TABLE addresses (
                           id      SERIAL PRIMARY KEY,
                           street  VARCHAR(255) NOT NULL,
                           town_id INTEGER      NULL REFERENCES locations (id) ON DELETE RESTRICT
);

-- Организации (Organization)
CREATE TABLE organizations (
                               id                  SERIAL PRIMARY KEY,
                               official_address_id INTEGER      NULL REFERENCES addresses (id) ON DELETE RESTRICT,
                               annual_turnover     BIGINT       NOT NULL CHECK (annual_turnover >= 1),
                               employees_count     INTEGER      NULL CHECK (employees_count IS NULL OR employees_count >= 1),
                               rating              BIGINT       NOT NULL CHECK (rating >= 1),
                               type                VARCHAR(64)  NULL,
                               postal_address_id   INTEGER      NOT NULL REFERENCES addresses (id) ON DELETE RESTRICT
);

-- Персоны (Person)
CREATE TABLE persons (
                         id          SERIAL PRIMARY KEY,
                         eye_color   VARCHAR(64)  NOT NULL,
                         hair_color  VARCHAR(64)  NULL,
                         location_id INTEGER      NOT NULL REFERENCES locations (id) ON DELETE RESTRICT,
                         birthday    TIMESTAMP    NOT NULL,
                         height      INTEGER      NOT NULL CHECK (height >= 1),
                         passport_id VARCHAR(255) NOT NULL CHECK (LENGTH(passport_id) >= 8 AND LENGTH(TRIM(passport_id)) > 0),
                         nationality VARCHAR(64)  NULL
);

-- Работники (Worker)
CREATE TABLE workers (
                         id              SERIAL PRIMARY KEY,
                         name            VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
                         coordinates_id  INTEGER      NOT NULL REFERENCES coordinates (id) ON DELETE RESTRICT,
                         creation_date   TIMESTAMP    NOT NULL,
                         organization_id INTEGER      NULL REFERENCES organizations (id) ON DELETE RESTRICT,
                         salary          INTEGER      NOT NULL CHECK (salary >= 1),
                         rating          REAL         NOT NULL CHECK (rating > 0.0),
                         start_date      TIMESTAMP    NOT NULL,
                         position        VARCHAR(64)  NULL,
                         status          VARCHAR(64)  NOT NULL,
                         person_id       INTEGER      NOT NULL REFERENCES persons (id) ON DELETE RESTRICT
);
