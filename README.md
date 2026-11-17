# ShowSpot

A responsive TV show browser built with React and Vite. Discover top-rated shows, search any title, filter by genre, read summaries and see the cast. Powered by the free TVmaze API (no API key needed).

## Features

- Top-rated shows on load, with skeleton loading placeholders
- Live search with debounce (no request on every keystroke)
- Genre filter chips, sorting (top rated, newest, A to Z)
- Pagination (12 shows per page)
- Detail popup: poster, rating, year, network, runtime, summary and cast
- Watchlist saved in localStorage (custom `useLocalStorage` hook)
- Clear error states with a retry button (no internet, API errors)
- Mobile-first, landscape-friendly layout

## Tech Stack

React 19, Vite, TVmaze REST API, CSS3

## Getting Started

    git clone https://github.com/Kingspac/showspot.git
    cd showspot
    npm install
    npm run dev

## Project Structure

    src/
      App.jsx             state, search, filters, pagination
      api.js              TVmaze requests and data normalizing
      ShowCard.jsx        poster card with rating and watchlist heart
      ShowModal.jsx       details popup with cast
      useLocalStorage.js  persistence hook
      index.css           styles

## Deployment (Render, static site)

- Build command: `npm install && npm run build`
- Publish directory: `dist`

## Credits

Data provided by [TVmaze](https://www.tvmaze.com/).

## Author

Bulus Kingsley, Full Stack Developer (MERN)
