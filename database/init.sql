CREATE TABLE HistoricalEvents (
    EventId     INT PRIMARY KEY,
    Title        VARCHAR(255),
    Location     VARCHAR(255),
    StartDate   DATE,
    EndDate     DATE,
    Description  TEXT
);

CREATE TABLE Artist (
    ArtistId   INT PRIMARY KEY,
    Name        VARCHAR(255) NOT NULL,
    Nationality VARCHAR(100),
    BirthYear  INT,
    DeathYear  INT
);

CREATE TABLE Artwork (
    ArtworkId   INT PRIMARY KEY,
    Title        VARCHAR(255) NOT NULL,
    Medium       VARCHAR(255),
    YearStart   INT,
    YearEnd     INT,
    Nationality  VARCHAR(100),
    ImageUrl    VARCHAR(500),
    Museum       VARCHAR(255),
    Description VARCHAR(500),
    ArtistId    INT,
    FOREIGN KEY (ArtistId) REFERENCES Artist(ArtistId)
);

CREATE TABLE Keyword (
    KeywordId     INT PRIMARY KEY,
    Term          VARCHAR(50) NOT NULL,
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
    MuseumId  INT NOT NULL,
    ArtistId  INT NOT NULL,
    PRIMARY KEY (MuseumId, ArtistId),
    FOREIGN KEY (MuseumId) REFERENCES Museum(MuseumId),
    FOREIGN KEY (ArtistId) REFERENCES Artist(ArtistId)
);

CREATE TABLE ArtistKeywords (
    ArtistId  INT NOT NULL,
    KeywordId INT NOT NULL,
    PRIMARY KEY (ArtistId, KeywordId),
    FOREIGN KEY (ArtistId) REFERENCES Artist(ArtistId),
    FOREIGN KEY (KeywordId) REFERENCES Keyword(KeywordId)
);

CREATE TABLE ArtworkKeywords (
    ArtworkId BIGINT NOT NULL,
    KeywordId INT NOT NULL,
    PRIMARY KEY (ArtworkId, KeywordId),
    FOREIGN KEY (ArtworkId) REFERENCES Artwork(ArtworkId),
    FOREIGN KEY (KeywordId) REFERENCES Keyword(KeywordId)
);

CREATE TABLE HistoricalEventKeywords (
    EventId   INT NOT NULL,
    KeywordId INT NOT NULL,
    PRIMARY KEY (EventId, KeywordId),
    FOREIGN KEY (EventId) REFERENCES HistoricalEvents(EventId),
    FOREIGN KEY (KeywordId) REFERENCES Keyword(KeywordId)
);