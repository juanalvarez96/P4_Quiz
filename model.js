//Quizzes
//Modelo de datos con array

const fs = require ("fs");

//Nombre del fichero donde almaceno los quizzes
//Tipo JSON
const DB_FILENAME = "quizzes.json";

let quizzes = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "París"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    }

];
/**
 * Método que va a arrancar el contenido de DB_FILENAME en la variable quizzes.
 * La primera vez que se ejecute, se lanzará un error (ENOENT).
 * En ese caso, se salva el contenido inicial almacenado en quizzes.
 */
const load = () => {
    fs.readFile(DB_FILENAME, (err,data) => {
        if (err){

            //La primera vez no existe el fichero
            if(err.code === "ENOENT"){
                save(); //Valores iniciales
                return;
            }
            throw err;
        }
        let json = JSON.parse(data);

        if(json){
            quizzes=json;
        }
    });
};
/**
 * Guarda las preguntas en el fichero
 * Guarda en fomato JSON el valor de quizzes
 */
const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
            if(err) throw err;
        });
};

/**
 * Cuenta el número total de preguntas existentes
 *
 * @return {number} número total de preguntas existentes
 */
exports.count = () => quizzes.length;

/**
 * Añade un nuevo quiz
 * @param question String con la pregunta
 * @param answer String con la respuesta
 */
exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(), //Trim quitan los espacios
        answer: (answer || "").trim()
    });
    save();
};
/**
 * Actualiza el quiz situado en la posicion index
 * @param id Clave que identifica el quiz a actualizar
 * @param question String con la pregunta a sustituír
 * @param answer String con la respuesta a sustituír
 */
exports.update = (id, question, answer)=>{ //IMP: Id va de 0 a n-1 elementos del array
    const quiz = quizzes[id];
    if (typeof id === "undefined") {
        throw new Error("El valor del parámetro id no es válido");
    }
    quizzes.splice(id,1,{//1 indica que sólo quito 1 elemento y meto el de abajo
        question: (question || "").trim(), //Trim quitan los espacios
        answer: (answer || "").trim()
    });
    save();
};

/**
 * Devuelve todos los quizzes existentes en formato json.
 * Una copia de los datos que tengo en el array
 * @return {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
 * Devuelve el un clon del quiz seleccionado con el id en formato JSON
 * @param id El id del quiz en el array quizzes
 * @return {any}
 */
exports.getByIndex = id => {

    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error("El valor del parámetro id no es válido");
    }
    return JSON.parse(JSON.stringify(quiz));
};

/**
 * Elimina el quiz seleccionado con el id
 * @param id EL id del quiz a eliminar
 */
exports.deleteByIndex = id => {

    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error("El valor del parámetro id no es válido");
    }
    quizzes.splice(id,1);//Función splice puede eliminar el quiz
    save();
};

load();