# Smart Mastering API for Node.js

This library provides access to [MarkLogic Smart Mastering](https://github.com/marklogic-community/smart-mastering-core) from Node.js applications. Smart Mastering allows you to improve the quality of your data by deduplicating information. You can use the API to:

- Determine documents that match based on similarity information specified in match options.
- Merge matching documents based on priority information specified in merge options.
- Match and merge documents with a single command.
- Review the matching and merging process by inspecting notifications and history information. 
- Roll back merges when necessary without loss of data.

For more information, see the Smart Mastering [documentation](https://marklogic-community.github.io/smart-mastering-core/).

## Setting Up

Requirements are the same as for [Smart Mastering](https://github.com/marklogic-community/smart-mastering-core) (MarkLogic 9.0-5+, Java 8+).

Set up the Smart Mastering project's [minimal-project](https://github.com/marklogic-community/smart-mastering-core/tree/master/examples/minimal-project) example. 

Open `config.js.sample` and edit the settings for your environment. Save as `config.js` in the same location.

Run the following from the project root to install dependencies:

`npm install`

## Running Tests

From the project root, run the following:

`npm test`

## Generating Documentation

Install JSDoc:

`npm install -g jsdoc`

From the project root, run the following:

`jsdoc -c ./jsdoc.json`

Documentation is generated in a `docs` folder.
