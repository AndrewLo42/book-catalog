# How to use
- Node v20 is required
- Create a .env file
    - ATLAS_URI=mongodb+srv://<user>:<password>@<cluster>mongodb.net/
- npm install
- npm run start
    - Backend will run on port 5050 unless specified
- Recommend using Postman to test endpoints

# Testing
- npm run test
- May need some configuration if something is off.
    - babel.config is commonjs file and test is mjs file 
    - Accounts for "type": "module" in our package.json

## Decision Points
- Handling other calls on the /:id route was a bit odd since something like /stats would have that route see "stats" as an id parameter. As per the PRD, the request should look like /books/:id and /books/search, so the overlap was handled with a if then statements. The /:id could be moved to something like /books/book/:id to clear up the route in the future?
    - Alternate way is to make id into /book/:id to keep the route separate
- MongoDB to deal with the need to quickly reshape data if needed as new ideas get laid out
    - Can scale out easily
    - Not a huge or complex relational database, so noSQL seemed appropriate to quickly bootstrap this together
    - Quick to share and collaborate with