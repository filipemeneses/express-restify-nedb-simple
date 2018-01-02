const express = require('express')
const nedb = require('nedb')

const crud = (Model, success = null) => {
  const router = express.Router()
  if (!success) success = (data) => ({ok: true, data})

  router.post('/', (req, res, next) => {
    Model.insert(req.body, (err, result) => {
      if (err) return next(err)
      res.json(success(result))
    })
  })

  router.get('/', (req, res, next) => {
    Model.find(req.query || {}, (err, result) => {
      if (err) return next(err)
      res.json(success(result))
    })
  })


  router.get('/count', (req, res, next) => {
    Model.count(req.query || {}, (err, result) => {
      if (err) return next(err)
      res.json(success(result))
    })
  })

  router.get(`/:id`, (req, res, next) => {
    Model.findOne({ _id: req.params.id }, (err, result) => {
      if (err) return next(err)
      res.json(success(result))
    })
  })

  router.put(`/:id`, (req, res, next) => {
    Model.update({ _id: req.params.id }, {$set: req.body}, { returnUpdatedDocs: true }, (err, _, result) => {
      if (err) return next(err)
      res.json(success(result))
    })
  })

  router.delete(`/:id`, (req, res, next) => {
    Model.remove({ id: req.params.id }, (err) => {
      if (err) return next(err)
      res.json(success(null))
    })
  })

  return router
}

module.exports = {
  serve (router, nedbDatabase, successFunc) {
    let modelName = nedbDatabase.filename.split('/')
    modelName = modelName[modelName.length - 1]
    modelName = modelName.match(/([a-zA-Z]+).db$/)[1]
    router.use(`/${modelName}`, crud(nedbDatabase, successFunc))
  }
}
