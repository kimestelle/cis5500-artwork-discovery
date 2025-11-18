CREATE TABLE HistoricalEvents (
    EventId     INTEGER PRIMARY KEY,
    Title        VARCHAR(255),
    Location     VARCHAR(255),
    StartDate   DATE,
    EndDate     DATE,
    Description  TEXT
);

CREATE TABLE Artist (
    ArtistId   INTEGER PRIMARY KEY,
    Name        VARCHAR(255) NOT NULL,
    Nationality VARCHAR(100),
    BirthYear  INTEGER,
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
    Description VARCHAR(500),
    ArtistId    INTEGER,
    CONSTRAINT fk_artwork_artist
        FOREIGN KEY (ArtistId) REFERENCES Artist(ArtistId)
);

CREATE TABLE Keyword (
    KeywordId     SERIAL PRIMARY KEY,
    Term          VARCHAR(50) NOT NULL UNIQUE,
    WikipediaURL  VARCHAR(100)
);

CREATE TABLE Museum (
    MuseumId  SERIAL PRIMARY KEY,
    Name      VARCHAR(50) NOT NULL,
    City      VARCHAR(50),
    Country   VARCHAR(50),
    Website   VARCHAR(100)
);

CREATE TABLE FeaturedArtists (
    MuseumId  INTEGER NOT NULL,
    ArtistId  INTEGER NOT NULL,
    PRIMARY KEY (MuseumId, ArtistId),
    CONSTRAINT fk_featured_museum
        FOREIGN KEY (MuseumId) REFERENCES Museum(MuseumId),
    CONSTRAINT fk_featured_artist
        FOREIGN KEY (ArtistId) REFERENCES Artist(ArtistId)
);

CREATE TABLE ArtistKeywords (
    ArtistId  INTEGER NOT NULL,
    KeywordId INTEGER NOT NULL,
    PRIMARY KEY (ArtistId, KeywordId),
    CONSTRAINT fk_artistkeywords_artist
        FOREIGN KEY (ArtistId) REFERENCES Artist(ArtistId),
    CONSTRAINT fk_artistkeywords_keyword
        FOREIGN KEY (KeywordId) REFERENCES Keyword(KeywordId)
);

CREATE TABLE ArtworkKeywords (
    ArtworkId BIGINT NOT NULL,
    KeywordId INTEGER NOT NULL,
    PRIMARY KEY (ArtworkId, KeywordId),
    CONSTRAINT fk_artworkkeywords_artwork
        FOREIGN KEY (ArtworkId) REFERENCES Artwork(ArtworkId),
    CONSTRAINT fk_artworkkeywords_keyword
        FOREIGN KEY (KeywordId) REFERENCES Keyword(KeywordId)
);

CREATE TABLE HistoricalEventKeywords (
    EventId   INTEGER NOT NULL,
    KeywordId INTEGER NOT NULL,
    PRIMARY KEY (EventId, KeywordId),
    CONSTRAINT fk_eventkeywords_event
        FOREIGN KEY (EventId) REFERENCES HistoricalEvents(EventId),
    CONSTRAINT fk_eventkeywords_keyword
        FOREIGN KEY (KeywordId) REFERENCES Keyword(KeywordId)
);
