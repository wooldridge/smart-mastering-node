# Smart Mastering API for Node.js

This library provides access to [MarkLogic Smart Mastering](https://github.com/marklogic-community/smart-mastering-core) from Node.js applications.

## Setting Up

Requirements are the same as for [Smart Mastering](https://github.com/marklogic-community/smart-mastering-core).

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
