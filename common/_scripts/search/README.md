## Updating Schema

1. Update the schema design for Elastic Cluster within `schema.json`
2. Reflect changes in `interfaces.ts` in the `interface ElasticSearchBody {}`
3. Look through providers in `index.ts` and update each individual provider's `map()` function and update the
   translation from the db record -> `ElasticSearchBody`
4. Run the script to tear down the index + rebuild with db data: `node index.js --scratch`(make sure to transpile
   typescript first per usual(`tsc -p .`))