CREATE TABLE Bios (
    name VARCHAR(255) NOT NULL,
    text VARCHAR(1000) 
    PRIMARY KEY name
    FOREIGN KEY name REFERENCES Artist(Name)

)