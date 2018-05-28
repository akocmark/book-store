/**
 * BookController
 *
 * @description :: Server-side logic for managing books
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const Promise = require('bluebird');
const fs      = require('fs');
const path    = require('path');
const moment  = require('moment');

module.exports = {

  /*
   * Find list of books
   * Method: GET
   * URL: /book
   */
  find: function (req, res) {
    var criteria = {
      where: {},
      sort: 'createdAt DESC'
    };

    // filter by tag (WHERE OR)
    if (req.query.tag) {
      if (!criteria.where.or || criteria.where.or.constructor !== new Array().constructor) {
        criteria.where.or = [];
      }

      criteria.where.or.push({
        tag: { contains: req.query.tag }
      });
    }

    // filter by date (WHERE OR)
    if (req.query.date) {
      if (!criteria.where.or || criteria.where.or.constructor !== new Array().constructor) {
        criteria.where.or = [];
      }

      var date      = moment(req.query.date, "DD-MM-YYYY");
      var startDate = date.startOf('day').toDate();
      var endDate   = date.endOf('day').toDate();

      criteria.where.or.push({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });
    }

    // filter by author (WHERE OR)
    if (req.query.author) {
      if (!criteria.where.or || criteria.where.or.constructor !== new Array().constructor) {
        criteria.where.or = [];
      }

      criteria.where.or.push({ author: req.query.author });
    }

    // filter by price (WHERE OR)
    if (req.query.price) {
      if (!criteria.where.or || criteria.where.or.constructor !== new Array().constructor) {
        criteria.where.or = [];
      }

      criteria.where.or.push({ price: req.query.price });
    }

    // limit by number
    if (req.query.limit) {
      criteria.limit = req.query.limit;
    }

    Book.find(criteria)

      .then(function (books) {
        return res.send(books);
      })

      .catch(function (err) {
        return res.send(500, err.toString());
      });
  },

  /*
   * Find single book
   * Method: GET
   * URL: /book/:bookId
   */
  findOne: function (req, res) {
    var bookId = req.params.id;

    Book.findOne({ id: bookId })

      .then(function (book) {
        if (!book) {
          return Promise.reject(new Error('Book record not existing!'));
        }

        return res.send(book);
      })

      .catch(function (err) {
        return res.send(500, err.toString());
      });
  },

  /*
   * Create a book
   * Method: POST
   * URL: /book
   */
  create: function (req, res) {
    var payload = req.body;

    if (!payload.name || !payload.author || !payload.price) {
      return res.send(500, new Error('Missing required fields!').toString());
    }

    var bookData = {
      name: payload.name,
      author: payload.author,
      price: payload.price
    };

    if (payload.tag) {
      bookData.tag = payload.tag;
    }

    // if there is a document to be uploaded
    if (req.file('document')) {
      req.file('document')

        .upload({
          maxBytes: 10000000, // 10mb max file size
          dirname: require('path').resolve(sails.config.appPath, 'assets/uploads')
        }, function (err, uploadedFiles) {
          if (err) {
            return res.send(500, err.toString());
          }

          // if no files were uploaded, respond with an error.
          if (uploadedFiles.length === 0){
            return res.send(500, new Error('Unable to upload book document!').toString());
          }

          // get uploaded file details
          bookData.document = {
            name: uploadedFiles[0].filename,
            type: uploadedFiles[0].type,
            size: uploadedFiles[0].size,
            url: uploadedFiles[0].fd.replace(sails.config.appPath + '/assets', sails.config.appUrl)
          };

          createBook(bookData);
        });
    } else {
      createBook(bookData);
    }

    function createBook (book) {
      Book.create(bookData)

        .then(function (book) {
          return res.send(book);
        })

        .catch(function (err) {
          return res.send(500, err.toString());
        });
    }
  },

  /*
   * Update single book
   * Method: PUT
   * URL: /book/:bookId
   */
  update: function (req, res) {
    var bookId  = req.params.id;
    var payload = req.body;


    Book.findOne({ id: bookId }).exec(function (err, matchingBook) {
      if (err) {
        return res.send(500, err.toString());
      }

      if (!matchingBook) {
        return res.send(500, new Error('Book record not existing!').toString());
      }

      var bookData = {};

      if (payload.name) {
        bookData.name = payload.name;
      }

      if (payload.author) {
        bookData.author = payload.author;
      }

      if (payload.price) {
        bookData.price = payload.price;
      }

      if (payload.tag) {
        bookData.tag = payload.tag;
      }

      // if there is a document to be uploaded
      if (req.file('document')) {
        req.file('document')

          .upload({
            maxBytes: 10000000, // 10mb max file size
            dirname: path.resolve(sails.config.appPath, 'assets/uploads')
          }, function (err, uploadedFiles) {
            if (err) {
              return res.send(500, err.toString());
            }

            // if no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0){
              return res.send(500, new Error('Unable to upload book document!').toString());
            }

            // get uploaded file details
            bookData.document = {
              name: uploadedFiles[0].filename,
              type: uploadedFiles[0].type,
              size: uploadedFiles[0].size,
              url: uploadedFiles[0].fd.replace(sails.config.appPath + '/assets', sails.config.appUrl)
            };

            // delete old book document, if existing
            if (matchingBook.document && matchingBook.document.url) {
              var bookDocumentPath = matchingBook.document.url.replace(sails.config.appUrl, sails.config.appPath + '/assets');

              // check if file exists
              fs.stat(bookDocumentPath, function(err, stat) {
                // file exists
                if (err === null) {
                  // unlink file
                  fs.unlink(bookDocumentPath, function (err) {
                    if (err) {
                      return res.send(500, err.toString());
                    }

                    updateBook(bookId, bookData);
                  });
                } else {
                  updateBook(bookId, bookData);
                }
              });

            } else {
              updateBook(bookId, bookData);
            }
          });
      } else {
        updateBook(bookId, bookData);
      }


      function updateBook (id, book) {
        Book.update({ id: id }, book)

          .then(function (updatedBook) {
            return res.send(updatedBook[0]);
          })

          .catch(function (err) {
            return res.send(500, err.toString());
          });
      }
    })

  },

  /*
   * Destroy single book
   * Method: DELETE
   * URL: /book/:bookId
   */
  destroy: function (req, res) {
    var bookId = req.params.id;

    Book.findOne({ id: bookId })

      .then(function (book) {
        if (!book) {
          return Promise.reject(new Error('Book record not existing!'));
        }

        return Book.destroy({ id: bookId });
      })

      .then(function () {
        return res.send('Ok');
      })

      .catch(function (err) {
        return res.send(500, err.toString());
      });
  }

};

