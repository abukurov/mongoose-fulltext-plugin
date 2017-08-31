# mongoose-fulltext-plugin

N-gram based searching for [mongoose](https://github.com/Automattic/mongoose) models

[![David](https://img.shields.io/david/abukurov/mongoose-fulltext-plugin.svg)]()
[![npm](https://img.shields.io/npm/dt/mongoose-fulltext-plugin.svg)](https://www.npmjs.com/package/mongoose-fulltext-plugin)
[![MIT](https://img.shields.io/npm/l/mongoose-fulltext-plugin.svg)](https://github.com/abukurov/mongoose-fulltext-plugin/blob/master/LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/mongoose-fulltext-plugin.svg)](https://www.npmjs.com/package/mongoose-fulltext-plugin)


## Installation

```js
$ npm install --save mongoose-fulltext-plugin
```

## Usage

```js
const mongoose = require('mongoose');
const fulltext = require('mongoose-fulltext-plugin');

const schema = new Schema({
    title: String,
    description: String
});

schema.plugin(fulltext);
const Model = mongoose.model('YourModelName', schema);

Model.search('custom text').then(...);
```

## Plugin Options 

* `fields` - array of document fields to be used for computing n-grams. All string fields by default. 
* `stemmer` - function to be used for computing word stem. [stemmer](https://www.npmjs.com/package/stemmer) by default.
