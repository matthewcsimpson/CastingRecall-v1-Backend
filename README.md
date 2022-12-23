# CastingRecall - API Server

Casting ReCall is a movie based guessing game in which the player attempts to geuss the titles of six movies baed on the cast list.
This API server genrates the key to each puzzle by querying The Movie Database using the following sequence:

1. Chose a random year between 1990 and now.
2. Get one of the most popular movies from that year.
3. Load five actors from that movie.
4. Randomly choose an actor from the previously loaded.
5. Choose one of that actors most popular movies, excluding any duplicates.
6. Load five more actors from that movie, excluding any dupicates.
7. Repeat until the total number of movies is 6.

This project is currently deployed at <http://casting-recall-api.herokuapp.com/>
Give the game a try at <https://castingrecall.herokuapp.com>

## Related

Here are some related projects

[Casting ReCall - React Front End](https://github.com/matthewcsimpson/castingrecall)

## API Reference

#### Get latest puzzle

```http
  GET /puzzle
```

#### Get list of puzzles

```http
  GET /puzzle/list
```

#### Get a specific puzzle

```http
  GET /puzzle/:puzzleid
```

| Parameter  | Type     | Description                       |
| :--------- | :------- | :-------------------------------- |
| `puzzleid` | `number` | **Required**. Id of item to fetch |

#### Generate a new puzzle

```http
  GET /puzzle/generate
```

## Technology & Dependancies

This project was created using the following.

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg" alt="express" width="40" height="40" />
<img src="https://www.vectorlogo.zone/logos/heroku/heroku-icon.svg" alt="heroku" width="40" height="40" />

Make sure to run `npm install`!

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file.

You will need to provide a TMDB API key.

`TMDB_API_KEY`=`{YOUR API KEY GOES HERE}`

`TMDB_DISCOVER_MOVIE_BY_YEAR_SORT_REV`=`"https://api.themoviedb.org/4/discover/movie?with_original_language=en&sort_by=revenue.desc&region=US&primary_release_year="`

`TMDB_SEARCH_POP_URL`=`"https://api.themoviedb.org/3/movie/popular?with_original_language=en&primary_release_year="`

`TMDB_SEARCH_CREDITS_FRONT`=`"https://api.themoviedb.org/3/movie/"`

`TMBD_SEARCH_CREDITS_BACK`=`"/credits"`

`TMDB_DISCOVER_MOVIE_BY_ACTOR`=`"https://api.themoviedb.org/3/discover/movie?sort_by=revenue.desc&region=US&with_original_language=en&with_cast="`

`SERVER_PORT` = `{PORT NUMBER HERE}`

## Author

- [@MatthewCSimpson](https://www.github.com/matthewcsimpson)
