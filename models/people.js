require('dotenv').config()
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(result => { console.log('Yhteys tietokantaan muodostettu')})
.catch(error => { console.log('Yhteys tietokantaan epäonnistui:', error.message) })

const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, required: true, unique: true },
  number: { type: String, minlength: 8, required: true }
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString()
    delete returnedObj._id
    delete returnedObj.__v
  }
})

module.exports = mongoose.model('Person', personSchema)