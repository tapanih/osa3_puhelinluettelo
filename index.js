require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())

morgan.token('data', (req, res) => {
  return JSON.stringify(req.body)
})

const tiny = ':method :url :status :res[content-length] - :response-time ms'

app.use(morgan(tiny, {
  skip: (req, res) => req.method === 'POST'
}))

app.use(morgan(tiny + ' :data', {
  skip: (req, res) => req.method !== 'POST'
}))

const Person = require('./models/people')

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {

  if(!req.body.name) {
    return res.status(400).json({
      error: 'name missing'
    })
  }

  if(!req.body.number) {
    return res.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {

  const person = { name: req.body.name }
  console.log('here')

  Person.findByIdAndUpdate(req.params.id, person, { number: req.body.number })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.estimatedDocumentCount().then()
  .then(count => {
    res.send(`<p>Phonebook has info for ${count} people</p>
              <p>${new Date()}</p>`)})
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    res.status(400).send({ error: 'malformatted id'})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})