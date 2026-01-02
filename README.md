## CastingRecall - v1 - Back End

Casting ReCall is a movie based guessing game in which the player attempts to geuss the titles of six movies baed on the cast list.
This API server genrates the key to each puzzle by querying The Movie Database using the following sequence:

1. Chose a random year between 1980 and now.
2. Get one of the most popular movies from that year.
3. Load five actors from that movie.
4. Randomly choose an actor from the previously loaded.
5. Choose one of that actors most popular movies, excluding any duplicates.
6. Load five more actors from that movie, excluding any dupicates.
7. Repeat until the total number of movies is 6.

This project is currently deployed at <http://casting-recall-api.herokuapp.com/>
Give the game a try at <https://castingrecall.herokuapp.com>

_Be sure to check out the front end repo: [Casting ReCall - React Front End](https://github.com/matthewcsimpson/castingrecall-frontend)._

## API Reference

#### Get latest puzzle

```
  GET /puzzle
```

#### Get list of puzzles

```
  GET /puzzle/list
```

| Query param | Type     | Description                                                 |
| :---------- | :------- | :---------------------------------------------------------- |
| `page`      | `number` | Page to load (optional, defaults to 1, must be >= 1).       |
| `pageSize`  | `number` | Items per page (optional, defaults to 20, max allowed 100). |

Example response

```
{
  "puzzles": [
    {
      "puzzleId": 1767070272758,
      "keyPeople": ["Actor One", "Actor Two"]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Get a specific puzzle

```
  GET /puzzle/:puzzleid
```

| Parameter  | Type     | Description                       |
| :--------- | :------- | :-------------------------------- |
| `puzzleid` | `number` | **Required**. Id of item to fetch |

## Technology & Dependancies

This project was created using the following.

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg" alt="express" width="40" height="40" />
<img src="https://www.vectorlogo.zone/logos/heroku/heroku-icon.svg" alt="heroku" width="40" height="40" />

## License

This project is available under the MIT License. See [LICENSE](LICENSE).

## Author

- [@MatthewCSimpson](https://www.github.com/matthewcsimpson)
