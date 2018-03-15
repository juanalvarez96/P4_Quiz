const out = require('./out.js');
const Sequelize = require('sequelize');

const {models} = require('./model');


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
    //PROMESA->ME DEVOLVERA TODOS LOS QUIZZES EXISTENETES
    models.quiz.findAll()
    //Debajo, quizzes es lo que me devuelve la promesa
        .then(quizzes => {
            quizzes.forEach(quiz => {
                out.log(` [${quiz.id}]: ${quiz.question}`);
            });
        })
        .catch(error => {
            out.errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });


};


const validateId = id => {
    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id = parseInt(id); //Coger la parte entera y demás
            if (Number.isNaN(id)) {
                reject(new Error(`EL valor del parámetro <id> no es un número`));
            } else {
                resolve(id); //Se resuelve la promesa con el id correcto.
            }
        }
    });
};


/**
 * Muestra el quizz indicado como parámetro
 *
 * @param id Clave del quizz a mostrar
 */
exports.showCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            out.log(`[${out.colorize(id, 'magenta')}]: ${quiz.question} ${out.colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            out.errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


/**
 * Convertimos la llamada rl.question a una promesa. Cuando la promesa se cumple,
 * esta proporciona el texto introducido por el ususario
 * @param rl Objeto readLine a implementar
 * @param text La pregunta que hay que hacer al usuarion
 */
const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(out.colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};

/**
 * Añade un nuevo quizz al modelo
 */
exports.addCmd = rl => {
    makeQuestion(rl, "Introduzca pregunta: ")
        .then(q => {
            return makeQuestion(rl, "Introduzca respuesta: ")
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            out.log(out.colorize('Se ha añadido el quiz', "magenta"));
        })
        .catch(Sequelize.ValidationError, error => {
            out.errorlog('El quiz es erróneo');
            error.errors.forEach(({message}) => out.errorlog(message));
        })
        .catch(error => {
            out.errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

/**
 * Borrar el quiz indicado
 *
 * @param id Indicador del quiz a borrar
 */
exports.deleteCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            out.errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};

/**
 * Edita el quiz seleccionado
 *
 * @param id Es el quiz a editar
 */
exports.editCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question), 0
            });
            return makeQuestion(rl, 'Introduzca pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write(quiz.answer), 0
                    });
                    return makeQuestion(rl, 'Introduzca respuesta')
                        .then(a => {
                            quiz.answer = a;
                            quiz.question = q;
                            return quiz;
                        });
                });
        })
        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            out.log("Se ha cambiado el quiz correctamente", "magenta");
        })
        .catch(Sequelize.ValidationError, error => {
            out.errorlog('Quiz erroneo');
            error.errors.forEach(({message}) => {
                out.errorlog(message)
            });
        })
        .catch(error => {
            out.errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};

/**
 * Testea el quiz indicado
 *
 *@param id Es el quiz a editar
 */
exports.testCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            makeQuestion(rl, ` ${quiz.question} ?`)
                .then(answer => {
                    if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                        out.log("Su respuesta es correcta");
                        // out.biglog("CORRECTO", "greeen");
                        rl.prompt();
                    }
                    else {
                        out.log("Su respuesta es incorrecta", "red");
                        rl.prompt();

                    }
                })
        })

        .catch(Sequelize.ValidationError, error => {
            out.errorlog('Quiz erroneo');
            error.errors.forEach(({message}) => {
                out.errorlog(message)
            });
        })
        .catch(error => {
            out.errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        })

};

/**
 * Empezar juego
 */
exports.playCmd = rl => {
    let scores = 0;
    let toBeResolved = [];
    models.quiz.findAll()
        .then(quizzes => {
            for (i = 0; i < quizzes.length; i++) {
                toBeResolved[i] = quizzes[i].id;
            }
            playOne(rl, toBeResolved, scores);
        })


};

const playOne = (rl, toBeResolved, scores) => {
    console.log(toBeResolved);
    if (toBeResolved.length === 0) {
        out.log("Ya no quedan mas preguntas");
        out.log("Su resultado: " + scores);
        rl.prompt();
    } else {
        let indice = Math.floor(Math.random() * toBeResolved.length);
        let id = toBeResolved[indice];
        toBeResolved.splice(indice, 1);
        validateId(id)
            .then(id => models.quiz.findById(id))
            .then(quiz => {
                if (!quiz) {
                    throw new Error(`No existe un quiz asociado al id=${id}.`);
                }
                makeQuestion(rl, ` ${quiz.question} ?`)
                    .then(answer => {
                        if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                            out.log("Su respuesta es correcta");
                            scores++;
                            out.biglog("CORRECTO", "green");
                            out.biglog(scores, "red");
                            playOne(rl, toBeResolved, scores);

                        }
                        else {
                            out.log("Su respuesta es incorrecta", "red");
                            rl.prompt();

                        }
                    })
            })


    }


};


/**
 * Enseña los créditos
 */
exports.creditsCmd = rl => {
    out.log("Autor:");
    out.log("JUAN Álvarez", "green");
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


/**
 * Método que devuelve el número de quizzes existentes
 * @return {*}
 */
const getNumberQuizzes = () => {
    return new Sequelize.Promise((resolve, reject) => {
        models.quiz.findAll()
            .then(quizzes => {
                let l = quizzes.length;
                resolve(l);
            });
    });

};









