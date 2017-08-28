const _ = require('lodash/fp');
const transformToBigram = require('n-gram').bigram;

const PUNCTUATION_RE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\s\-.\/:;<=>?@\[\]^_`{|}~]/g;

module.exports = function mongooseFulltextPlugin(schema, options = {}) {
  const bigramPath = options.bigramPath || '_bigram';

  schema.path(bigramPath, {
    type: [String],
    lowercase: true,
    index: true,
  });

  schema.pre('save', function preSaveHook(next) {
    const plainDocument = this.toObject();
    const fields = options.fields || Object.keys(plainDocument);
    const normalizeBigram = _.flow([
      _.without(['id', '_id', '__v', bigramPath]),
      _.map(attribute => _.get(attribute)(plainDocument)),
      _.filter(value => _.isString(value) && value),
      _.replace(PUNCTUATION_RE, ''),
      transformToBigram,
      _.uniq
    ]);

    this.set(bigramPath, normalizeBigram(fields));
    next();
  });

  // eslint-disable-next-line no-param-reassign
  schema.statics.search = function search(query = '', ...rest) {
    const words = query.split(/\s+/)
      .map(word => word.replace(PUNCTUATION_RE, ''))
      .filter(word => _.size(word) >= 2);

    return this.find(!_.isEmpty(words) ? {
      $or: words.map(word => ({
        [bigramPath]: {
          $all: transformToBigram(word),
        },
      })),
    } : {}, ...rest);
  };
};
