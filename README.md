## CastingRecall - v1 - Back End

Casting ReCall is a movie based guessing game in which the player attempts to guess the titles of six movies based on the cast list.
This API server generates the key to each puzzle by querying The Movie Database using the following sequence:

1. Choose a random year between 1980 and now.
2. Get one of the most popular movies from that year.
3. Load five actors from that movie.
4. Randomly choose an actor from the previously loaded.
5. Choose one of that actor's most popular movies, excluding any duplicates.
6. Load five more actors from that movie, excluding any duplicates.
7. Repeat until the total number of movies is 6.

Give the game a try at <https://castingrecall.herokuapp.com>

_Be sure to check out the front end repo: [Casting ReCall - React Front End](https://github.com/matthewcsimpson/castingrecall-frontend)._

## Technology & Dependencies

This project was created using the following.

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="60" height="60" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" alt="javascript" width="60" height="60" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg" alt="express" width="60" height="60" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" alt="postgres" width="60" height="60"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/heroku/heroku-plain.svg" alt="Heroku" width="60" height="60"/>

## Author

[Matthew Simpson](https://mattsimpson.name)

## License

This project is available under the MIT License. See [LICENSE](LICENSE).
