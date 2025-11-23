SELECT
  Artwork.Title AS ArtworkTitle,
  Artist.Name AS ArtistName,
  HistoricalEvents.Title AS EventTitle,
  HistoricalEvents.Location AS EventLocation,
  HistoricalEvents.StartDate,
  HistoricalEvents.EndDate
FROM Artwork
JOIN Artist ON Artwork.ArtistID = Artist.ArtistID
JOIN HistoricalEvents ON Artist.Nationality = HistoricalEvents.Location
ORDER BY Artist.Nationality, HistoricalEvents.StartDate;