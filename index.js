const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
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

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 4
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

const getRandomInt = () => {
  return Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1
}

app.post('/api/persons', (req, res) => {

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

  if(persons.some(p => p.name === req.body.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: req.body.name,
    number: req.body.number,
    id: getRandomInt()
  }

  persons = persons.concat(person)
  res.json(person)
})

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})