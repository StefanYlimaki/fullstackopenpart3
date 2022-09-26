require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const mongoose = require('mongoose')
const Person = require('./models/person')

morgan.token('body', req => {
    return JSON.stringify(req.body)
  })

const cors = require('cors')
const { response } = require('express')
const { collection } = require('./models/person')
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', function (req, res) {
    res.send('hello, world!')
  })

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        res.send(`
            <div>
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}
            <div>
        `)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if(person){
            res.json(person)
        } else {
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
    return(Math.floor(Math.random()*1000000))
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    if(!body.name){
        return res.status(400).json({
            error: 'name missing'
        })
    } 

    if(!body.number){
        return res.status(400).json({
            error: 'number missing'
        })
    } 

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId()
    })

    morgan.token()
    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
      .then(updatedPerson => {
        res.json(updatedPerson)
      })
      .catch(error => next(error))
  })


/************ Tuntemattomat kohteet *****************/


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

/************ Virheiden Käsittely *****************/

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
  }

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})