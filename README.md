# express-restify-nedb-simple

Easily create a simple express REST interface for nedb models.

## Getting started

```sh
npm install express-restify-nedb-simple --save
```

## Usage

This snippet…

```js
const app = express()
const router = express.Router()
const usersModel = new Datastore('path/to/users.db')

app.use(bodyParser.json())
restify.serve(router, usersModel)

app.use('/api', router)
```

…automatically generates these endpoints:

```
GET http://localhost/api/users/count
GET http://localhost/api/users
POST http://localhost/api/users

GET http://localhost/api/users/:id
PUT http://localhost/api/users/:id
DELETE http://localhost/api/users/:id
```

the default response is a JSON:

```json
{
  "ok": true,
  "data": {}
}
```

You can add a custom response by adding a third parametter:

```js
restify.serve(router, usersModel, (data) => {myResponse: data})
```

> Case errors, will pass by the error with `next()`
