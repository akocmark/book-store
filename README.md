# Book Store

TODO:
* DONE - Add a book - upload actual document along with details like price, book name, author, price etc
* DONE - Get a list of all books
* DONE - Get single book
* DONE - Delete a book
* DONE - Rename a tag
* DONE - Get a list of all books and to filter that list by tag or date or limit by number, author, price

Check codes at:
`/book-store/api/controllers/BookController.js`


```
RESTful routes

/*
 * Find list of books
 * method: GET
 * URL: http://localhost:1337/api/book
 * Controller Action: BookController.find
 */

/*
 * Find list of books with filters
 * method: GET
 * URL: http://localhost:1337/api/book
 * params: ?author=Mark%20Gutierrez&price=100&limit=2&tag=some%20tag&date=28/05/2018
 * Controller Action: BookController.find
 */

/*
 * Find single book
 * method: GET
 * URL: http://localhost:1337/api/book/:id
 * Controller Action: BookController.findOne
 */

/*
 * Create a book
 * method: POST
 * URL: http://localhost:1337/api/book
 * Controller Action: BookController.create
 */

/*
 * Update a book
 * method: PUT
 * URL: http://localhost:1337/api/book/:id
 * Controller Action: BookController.update
 */

/*
 * Destroy a book
 * method: DELETE
 * URL: http://localhost:1337/api/book/:id
 * Controller Action: BookController.destroy
 */
```
