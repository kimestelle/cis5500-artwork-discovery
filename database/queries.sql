-- Create tables

CREATE TABLE historical_events (
    eventId     INTEGER PRIMARY KEY,
    title        VARCHAR(255),
    location     VARCHAR(255),
    startDate   DATE,
    endDate     DATE,
    description  TEXT
);
