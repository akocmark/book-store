/**
 * Book.js
 *
 * @description :: Model for book
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = {
  attributes: {
    name: {
      type: 'string'
    },

    author: {
      type: 'string'
    },

    price: {
      type: 'float'
    },

    tag: {
      type: 'text'
    },

    document: {
      type: 'Object'
    }
  }
};

