const _ = require('lodash/fp');
const defaultStemmer = require('stemmer');

const WHITESPACE_RE = /[\s\f\n\r\t\v\u00A0\u2028\u2029]+/;
const PUNCTUATION_RE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]/g;

function createNGrams(input, withSuffix = false, min = 2) {
  const nGrams = [];
  const string = String(input);

  for (let index = 0; index <= (withSuffix ? string.length - min : 0); index += 1) {
    for (let cardinality = index + min; cardinality <= string.length; cardinality += 1) {
      nGrams.push(string.slice(index, cardinality).toLowerCase());
    }
  }

  return nGrams;
}

module.exports = function mongooseFulltextPlugin(schema, options = {}) {
  const stemmer = options.stemmer || defaultStemmer;

  schema.path('__nGrams', String);
  schema.path('__prefixNGrams', String);

  schema.index({
    __nGrams: 'text',
    __prefixNGrams: 'text',
  }, {
    name: 'NGrams Index',
    weights: {
      __nGrams: 100,
      __prefixNGrams: 200,
    },
  });

  schema.pre('save', function preSaveHook(next) {
    const plainDocument = this.toObject();
    const fields = options.fields || Object.keys(plainDocument);
    const attributes = _.flow([
      _.without(['id', '_id', '__v', '__nGrams', '__prefixNGrams']),
      _.map(attribute => _.get(attribute)(plainDocument)),
      _.filter(value => _.isString(value) && value),
      _.replace(PUNCTUATION_RE, ''),
      _.split(WHITESPACE_RE),
      _.map(stemmer)
    ])(fields);

    this.set('__nGrams', attributes.map(attribute => createNGrams(attribute, true)));
    this.set('__prefixNGrams', attributes.map(attribute => createNGrams(attribute)));

    next();
  });

  // eslint-disable-next-line no-param-reassign
  schema.statics.search = function search(query = '', ...other) {
    const normalizedQuery = (String(query) || '').replace(PUNCTUATION_RE, '').toLowerCase();

    return this.find(normalizedQuery.length >= 2 ? {
      $text: {
        $search: normalizedQuery,
      },
    } : {}, ...other);
  };
};

module.exports.createNGrams = createNGrams;
