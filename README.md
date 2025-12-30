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

## Local Setup

1. Install dependencies with npm install.
2. Copy .env and provide TMDB credentials plus DATABASE_URL (example: postgres://matthewsimpson@localhost:5432/casting_recall).
3. Run npm run migrate to apply database migrations.
4. Optionally run npm run seed to load the sample JSON puzzles into Postgres.
5. Start the server with npm run dev or npm start.

## Database Management

- Migrations live in the migrations directory and execute in filename order through scripts/runMigration.js.
- The migration runner records applied files in schema_migrations to support repeatable deployments.
- The seed script reads JSON files from data and upserts them into the puzzles table for local testing.
- To reset the local database quickly, issue TRUNCATE TABLE puzzles RESTART IDENTITY;

## Deployment Notes

- Provision Postgres on Heroku with heroku addons:create heroku-postgresql:hobby-dev.
- Confirm that the Heroku config var DATABASE_URL is present (Heroku supplies this automatically when the addon is created).
- Run migrations by executing heroku run npm run migrate.
- Optionally hydrate production with historical puzzles by running heroku run npm run seed after uploading JSON files or generating new ones.

## API Reference

#### Get latest puzzle

```
  GET /puzzle
```

#### Get list of puzzles

```
  GET /puzzle/list
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
