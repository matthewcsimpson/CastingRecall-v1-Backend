for (let i = 1; i < 6; i++) {
  // get an actor from the array
  let actor = await getRandomActor(actorArray);
  await console.log(`actor: ${actor.name}`);
  // get a movie by that actor
  let movie = await getMovieByActorID(actor.id, movieArray);

  // check the movie returned
  if (movie) {
    // if the movie returned, push the ID in to the array
    movieArray.push(movie);
  } else {
    // if the movie did not return, filter out the previously chosen actor and search for a new one
    let tempActors = actorArray.filter(
      (tempActor) => tempActor.id !== actor.id
    );
    let newActor = await getRandomActor(tempActors);
    // get a new movie
    movie = await getMovieByActorID(newActor.id, movieArray);
  }
  await console.log(`movie: ${movie.original_title}`);
  //load five actors from the chosen movie
  let fiveMoreActors = await getFiveActors(movie.id, actorArray);
  // spread the new ive actors into the existing array of actors
  actorArray = [...actorArray, ...fiveMoreActors];
}

let count = 0;
actorArray.forEach((actor) => (actor === null ? "" : count++));
console.log(`count: ${count}`);
const newPuzzle = {
  puzzleId: uuidv4(),
  movies: movieArray,
  actors: actorArray,
};

let actor = getRandomActor(tempArray[i - 1].cast);
let movie = await axios
  .get(`${TMDB_SEARCH_POP_URL}${randomYear}&api_key=${API_KEY}`)
  .then((res) => {
    let rawResults = res.data.results.filter(
      (movie) =>
        !movie.genre_ids.includes(99) && !movie.genre_ids.includes(1077)
    );
    return rawResults.find((movie, i) => {
      if (i === randomPick) {
        return movie;
      }
    });
  })
  .catch((e) => console.error(e));
