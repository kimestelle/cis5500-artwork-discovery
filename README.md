# cis5500-artwork-discovery
Art enthusiasts frequently struggle when trying to explore artworks and the historical or cultural narratives surrounding them, since information is often fragmented over the internet. Although major museums like MoMA and The Met offer extensive online collections, their individual systems make cross-museum discovery difficult, especially for users who want to locate where certain artworks are displayed, learn about an artist’s background, or understand the historical forces influencing artistic movements. ArtAtlas aggregates disparate art-related datasets into a single, integrated platform that allows users to explore artworks, artists, museums, and world events in an intuitive and interactive way.
The goals of our project are twofold: first, to enable seamless discovery across museums to connect users with artworks based on museum, artist, medium, artist nationality, and time of creation; and second, to enrich the user’s understanding of the art and artists they search for with deeper context, including artist biographies, similar artists or artworks based on shared keywords or time of creation, and historical events relevant to the artwork’s creation.
## running instructions (PLEASE NAVIGATE TO THE "LOCAL" BRANCH IF ACCESSING FROM GITHUB!)
```cd client```
```npm i```
```npm start```
*in a new terminal:*
```cd server```
```npm i```
```npm start```
## subdirectory guide:
- artworks-frontend: NextJS frontend
- backend: API queries from database
- database: SQL queries
- preprocessing: interactive notebooks used to preprocess data (original files not included due to size issues)
## dependencies
### frontend
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.10.5",
    "@emotion/styled": "^11.10.5",
    "@mui/material": "^5.11.1",
    "@mui/x-data-grid": "^5.17.17",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "d3": "^7.9.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.6.1",
    "recharts": "^2.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@pmmmwh/react-refresh-webpack-plugin": "^0.6.2",
    "babel-loader": "^10.0.0"
  }
}
### backend
{
  "name": "server",
  "version": "1.0.0",
  "private": true,
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "nodemon": "^3.1.11",
    "pg": "^8.12.0",
    "pool": "^0.4.1",
    "supertest": "^6.3.3"
  },
  "devDependencies": {
    "jest": "^29.3.1"
  }
}