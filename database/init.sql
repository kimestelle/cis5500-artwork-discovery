CREATE TABLE HistoricalEvents (
    EventId     INTEGER PRIMARY KEY,
    Title        VARCHAR(255),
    Location     VARCHAR(255),
    StartDate   DATE,
    EndDate     DATE,
    Description  TEXT
);

CREATE TABLE Artist (
    ArtistId   INTEGER PRIMARY KEY,          -- from ArtistID in CSV
    Name        VARCHAR(255) NOT NULL,
    Nationality VARCHAR(100),
    BirthYear  INTEGER,                      -- parsed from BirthYear
    DeathYear  INTEGER
);

CREATE TABLE Artwork (
    ArtworkId   BIGINT PRIMARY KEY,
    Title        VARCHAR(255) NOT NULL,
    Medium       VARCHAR(255),
    YearStart   INTEGER,
    YearEnd     INTEGER,
    Nationality  VARCHAR(100),
    ImageUrl    VARCHAR(500),
    Museum       VARCHAR(255),
    ArtistId    INTEGER,
    CONSTRAINT fk_artwork_artist
        FOREIGN KEY (ArtistId) REFERENCES Artist(ArtistId)
);