# CastingCall-Server

This Node.js app uses TMDB to generate a puzzle key for the guessing game Casting.  

Keys are generated using this sequence:
1. Chose a random year between 1990 and now. 
2. Get one of the most popular movies from that year. 
3. Load five actors from that movie. 
4. Randomly choose an actor from the previously loaded. 
5. Choose one of that actors most popular movies, excluding any duplicates. 
6. Load five more actors from that movie, excluding any dupicates.
7. Repeat until the total number of movies is 6, and actors is 30. 
