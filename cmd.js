const out = require('./out.js');

const model = require('./model.js');


/**
 * Muestra la ayuda.
 */
exports.helpCmd = rl => {
    out.log("Comandos:");
    out.log("h|help - Muestra ayuda.");
    out.log("list - Listar todos los quizzes");
    out.log("show <id> - Muestra la pregunta y la respuesta del quiz seleccionado.");
    out.log("add - Añadir quiz interactivamente");
    out.log("delete <id> - Borrar el quiz seleccionado");
    out.log("edit <id> - Editar el quiz seleccionado");
    out.log("test <id> - Testear el quiz seleccionado");
    out.log("p|play - Jugar");
    out.log("credits - creditos");
    out.log("q|quit - Salir del programa");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes
 */
exports.listCmd = (rl, id) => {
    model.getAll().forEach((quiz, id) => {
        out.log(` [${id}]: ${quiz.question}`);
    });
    rl.prompt();
};

/**
 * Muestra el quizz indicado como parámetro
 *
 * @param id Clave del quizz a mostrar
 */
exports.showCmd = (rl, id) => {
    if (typeof id === "undefined") {
        out.errorlog(`Falta el parámetro id`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            out.log(`[${out.colorize(id, 'magenta')}]: ${quiz.question} ${out.colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch (error) {
            out.errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Añade un nuevo quizz al modelo
 */
exports.addCmd = rl => {
    rl.question('Introduzca una pregunta: ', question => {
        rl.question('Introduzca la respuesta: ', answer => {
            model.add(question, answer);
            out.log(`Se ha añadido la pregunta:  ${question}`);
            rl.prompt();
        });
    });

};

/**
 * Borrar el quiz indicado
 *
 * @param id Indicador del quiz a borrar
 */
exports.deleteCmd = (rl, id) => {
    if (typeof id === "undefined") {
        out.errorlog(`Falta el parámetro id`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            out.log(`[${out.colorize(id, 'magenta')}]: ${quiz.question} ${out.colorize('=>', 'magenta')} ${quiz.answer}`);
            model.deleteByIndex(id);
        } catch (error) {
            out.errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Edita el quiz seleccionado
 *
 * @param id Es el quiz a editar
 */
exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        out.errorlog(`Falta el parámetro id`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            out.log(`[${out.colorize(id, 'blue')}]: ${quiz.question}`);
            rl.question('Introduzca nueva pregunta: ', question => {
                out.log(`${out.colorize('Respuesta', 'blue')} ${quiz.answer}`);
                rl.question('Introduzca respuesta: ', answer => {
                    model.update(id, question, answer);
                    out.log('Se ha cambiado el quiz correctamente.', 'green');
                    rl.prompt();
                });
            });

        } catch (error) {
            out.errorlog(error.message);
            rl.prompt();
        }
    }

};

/**
 * Testea el quiz indicado
 *
 *@param id Es el quiz a editar
 */
exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        out.errorlog(`Falta el parámetro id`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            rl.question(quiz.question + "?  ", respuesta => {
                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                    out.biglog("CORRECTO", "blue");
                }
                else {
                    out.biglog("INCORRECTO", "blue");
                }
                rl.prompt();
            });
        } catch (error) {
            out.errorlog(error.message);
            rl.prompt();
        }
    }


};

/**
 * Empezar juego
 */
exports.playCmd = rl => {

    let score = 0;

    let toBeResolved = []; //Array para las preguntas que no estan resueltas. Se guradan los ids
    //Ids de las preguntas
    for (i = 0; i < model.getAll().length; i++) {
        toBeResolved[i] = i;
    }

    const playOne = () => {
        if (toBeResolved.length === 0) {
            out.log("Ya no quedan mas preguntas", "red");
            out.log("Su resultado: " + score);
            rl.prompt();
        } else {
            let indice = Math.floor(Math.random() * toBeResolved.length);
            let id = toBeResolved[indice];
            out.log("Antes de eliminar "+ toBeResolved);
            out.log("El indice (aleatorio) "+ indice);
            out.log("El id de la pregunta "+ id);
            toBeResolved.splice(indice, 1);
            out.log(toBeResolved+ " Despues de eliminar");
            let quiz = model.getByIndex(id);
            rl.question(quiz.question + "?  ", respuesta => {
                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                    out.biglog("CORRECTO", "blue");
                    score++;
                    out.log("Su resultado: " + score);
                    playOne();
                }
                else {
                    out.biglog("INCORRECTO", "blue");
                    out.log("Su resultado: " + score);
                }
                rl.prompt();
            });

        }
    };
    playOne();

};


/**
 * Enseña los créditos
 */
exports.creditsCmd = rl => {
    out.log("Autor:");
    out.log("Juan Álvarez", "green");
    rl.prompt();
};

/**
 * Cierra el programa
 * @param rl
 */
exports.quitCmd = rl => {
    out.log("Adios");
    rl.close();
};











