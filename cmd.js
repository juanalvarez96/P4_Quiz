const out = require('./out.js');
const Sequelize = require('sequelize');

const {models} = require('./model');


/**
 * Muestra la ayuda.
 */
exports.helpCmd =(socket,  rl) => {
    out.log(socket, "Comandos:");
    out.log(socket, "h|help - Muestra ayuda.");
    out.log(socket, "list - Listar todos los quizzes");
    out.log(socket, "show <id> - Muestra la pregunta y la respuesta del quiz seleccionado.");
    out.log(socket, "add - Añadir quiz interactivamente");
    out.log(socket, "delete <id> - Borrar el quiz seleccionado");
    out.log(socket, "edit <id> - Editar el quiz seleccionado");
    out.log(socket, "test <id> - Testear el quiz seleccionado");
    out.log(socket, "p|play - Jugar");
    out.log(socket, "credits - creditos");
    out.log(socket, "q|quit - Salir del programa");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes
 */
exports.listCmd = (socket, rl, id) => {
    //PROMESA->ME DEVOLVERA TODOS LOS QUIZZES EXISTENETES
    models.quiz.findAll()
    //Debajo, quizzes es lo que me devuelve la promesa
        .then(quizzes => {
            quizzes.forEach(quiz => {
                out.log(socket,` [${quiz.id}]: ${quiz.question}`);
            });
        })
        .catch(error => {
            out.errorlog(socket, error.message);
        })
        .then(() => {
            rl.prompt();
        });


};


const validateId = (socket, id) => {
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
exports.showCmd = (socket, rl, id) => {
    validateId(socket, id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            out.log(socket,`[${out.colorize(id, 'magenta')}]: ${quiz.question} ${out.colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            out.errorlog(socket, error.message);
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
const makeQuestion = (socket, rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(out.colorize(text, 'red'), (answer) => {
            resolve(answer.trim());

        });
    });
};

/**
 * Añade un nuevo quizz al modelo
 */
exports.addCmd = (socket, rl) => {
    makeQuestion(socket, rl, "Introduzca pregunta: ")
        .then(q => {
            return makeQuestion(socket, rl, "Introduzca respuesta: ")
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            out.log(socket,out.colorize('Se ha añadido el quiz', "magenta"));
        })
        .catch(Sequelize.ValidationError, error => {
            out.errorlog(socket, 'El quiz es erróneo');
            error.errors.forEach(({message}) => out.errorlog(socket, message));
        })
        .catch(error => {
            out.errorlog(socket, error.message);
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
exports.deleteCmd = (socket, rl, id) => {
    validateId(socket, id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            out.errorlog(socket, error.message);
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
exports.editCmd = (socket, rl, id) => {
    validateId(socket, id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            /**
            //La razón de esta linea de código esta explicada en el screencast 2 ó 3
            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question), 0
            });
             **/
            return makeQuestion(socket, rl, 'Introduzca pregunta: ')
                .then(q => {
                    /**
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write(quiz.answer), 0
                    });
                     **/
                    return makeQuestion(socket, rl, 'Introduzca respuesta: ')
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
            out.log(socket,"Se ha cambiado el quiz correctamente", "magenta");
        })
        .catch(Sequelize.ValidationError, error => {
            out.errorlog(socket, 'Quiz erroneo');
            error.errors.forEach(({message}) => {
                out.errorlog(socket, message)
            });
        })
        .catch(error => {
            out.errorlog(socket, error.message);
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
exports.testCmd = (socket, rl, id) => {
    validateId(socket, id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            makeQuestion(socket, rl, ` ${quiz.question} ?`)
                .then(answer => {
                    if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                        out.log(socket,"Su respuesta es correcta");
                        out.biglog(socket,"CORRECTO", "green");

                    }
                    else {
                        out.log(socket,"Su respuesta es incorrecta", "red");


                    }

                })
                .then(()=>{
                    rl.prompt();
                })
        })

        .catch(Sequelize.ValidationError, error => {
            out.errorlog(socket, 'Quiz erroneo');
            error.errors.forEach(({message}) => {
                out.errorlog(socket, message)
            });
        })
        .catch(error => {
            out.errorlog(socket, error.message);
        })


};

/**
 * Empezar juego
 */
exports.playCmd = (socket, rl) => {
    let scores = 0;
    let toBeResolved = [];
    models.quiz.findAll()
        .then(quizzes => {
            for (i = 0; i < quizzes.length; i++) {
                toBeResolved[i] = quizzes[i].id;
            }
            playOne(socket, rl, toBeResolved, scores);
        })


};

const playOne = (socket, rl, toBeResolved, scores) => {
   // console.log(toBeResolved);
    if (toBeResolved.length === 0) {
        out.log(socket,"Ya no quedan mas preguntas");
        out.log(socket,"Su resultado: " + scores);
        rl.prompt();
    } else {
        let indice = Math.floor(Math.random() * toBeResolved.length);
        let id = toBeResolved[indice];
        toBeResolved.splice(indice, 1);
        validateId(socket, id)
            .then(id => models.quiz.findById(id))
            .then(quiz => {
                if (!quiz) {
                    throw new Error(`No existe un quiz asociado al id=${id}.`);
                }
                makeQuestion(socket, rl, ` ${quiz.question} ?`)
                    .then(answer => {
                        if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                            out.log(socket,"Su respuesta es correcta");
                            scores++;
                            out.biglog(socket,"CORRECTO", "green");
                            out.biglog(socket,scores, "red");
                            playOne(socket,rl, toBeResolved, scores);

                        }
                        else {
                            out.log(socket,"INCORRECTO - Fin del juego. Aciertos "+ scores);
                            rl.prompt();

                        }
                    })
            })


    }


};


/**
 * Enseña los créditos
 */
exports.creditsCmd = (socket,rl) => {
    out.log(socket,"Autor:");
    out.log(socket,"JUAN Álvarez", "green");
    rl.prompt();
};

/**
 * Cierra el programa
 * @param rl
 */
exports.quitCmd = (socket, rl) => {
    out.log(socket,"Adios");
    rl.close();
    socket.end();
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









