// .then(async (res) => {
    //   movieArray.push(res);
    //   return await axios
    //     .get(
    //       `${TMDB_SEARCH_CREDITS_FRONT}${res.id}${TMBD_SEARCH_CREDITS_BACK}?api_key=${API_KEY}`
    //     )
    //     .then(async (res) => {
    //       res.data.cast.map((cast) => {
    //         if (cast.order < 5) {
    //           actorArray.push(cast);
    //         }
    //       });
    //     });
    // })