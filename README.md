# dp-map-builder-ui
react component ui for map builder


Make sure you have the latest Stable or LTS version of Node.js installed.

1. `git clone git@github.com:ONSdigital/dp-map-builder-ui.git`
2. Run `npm install`
3. Start the dev server using `npm start`
3. Open [http://localhost:8080](http://localhost:8080)

## Available Commands

- `npm start` - start the dev server
- `npm clean` - delete the dist folder
- `npm run production` - create a production ready build in `dist` folder
- `npm run lint` - execute an eslint check
- `npm test` - run all tests
- `npm run test:watch` - run all tests in watch mode
- `npm run coverage` - generate code coverage report in the `coverage` folder


### Notes
- The map builder is only as good as the topology files it offers. These are obtained via the github api from [github.com/ONSvisual/topojson_boundaries](https://github.com/ONSvisual/topojson_boundaries)
- The map builder calls the github api without authentication to retrieve the list of topology files (every time it starts - so once for every map). The api has a rate limit of 60 requests/hour unless you're authenticated: [developer.github.com/v3/#rate-limiting](https://developer.github.com/v3/#rate-limiting). You may hit this limit if multiple people are creating maps at the same time.
- There are a lot of options in the map-renderer service that this builder hides away from the user and hard-codes.
  - the position of the legends. These are hard-coded at the top and right of the map.
  - width: The map width at which the visibility of the legends switches from horizontal to vertical. 400.
  - min_width & max_width: The minimum and maximum sizes of the map - it is responsive within these limits. 300 - 500.
  - The ID and Name properties used in the topology files. These are AREACD and AREANM respectively - and this holds true for all topologies currently in the repository.

