
const Sequelize = require ('sequelize');

//Fichero donde se aloja la base de datos
const sequelize = new Sequelize ("sqlite:quizzes.sqlite", {logging : false});

//No asignamos la definición del quiz a una variable porque
//cada vez que defino un modelo en sequelize se crea un array que se llama models
sequelize.define('quiz', {
    question: {
        type: Sequelize.STRING,
        //Cada pregunta tiene que ser única
        unique: {msg: "Ya existe esa pregunta"},
        //No se pueden hacer preguntas vacías
        validate: {notEmpty: {msg: "La pregunta no puede estar vacía"}}
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
    }
});

//Promesa
sequelize.sync()
//Abajo hago una nueva promesa
.then(() => sequelize.models.quiz.count()) //Asi es como accedo al modelo quiz
.then(count =>{
    //Si hay cero quizzes
    if(!count) {
     return sequelize.models.quiz.bulkCreate([
         {question:"Capital de Italia", answer:"Roma"},
         {question:"Capital de Francia", answer:"París"},
         {question:"Capital de España", answer:"Madrid"},
         {question:"Capital de Portugal", answer:"Lisboa"}
     ]);
    }
}).catch(error =>{
    console.log(error);
});

module.exports = sequelize;