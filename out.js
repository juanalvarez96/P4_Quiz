
const figlet = require('figlet');
const chalk = require('chalk');
const out = require ('./out.js');

/**
 * Dar color a un string
 *
 * @param msg String al que le vamos a dar color
 * @param color EL color con el que se va a pintar
 * @return {string} El string msg con color determinado
 */
exports.colorize = (msg, color) =>{
    if (typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};

/**
 * Escribir el mensaje por consola
 * @param msg Text
 * @param color Color que adqueire el texto
 */
exports.log = (msg, color) => {
    console.log(out.colorize(msg, color));
};

/**
 * Similar al método anterior. Aquí usamos figlet para
 * que el texto sea mayor y ocupetodo el hztl view
 * @param msg Mensaje a escribir
 * @param color Color del mensaje
 */
exports.biglog = (msg, color) => {
    out.log(figlet.textSync(msg, {horizontalLayout:'full'}), color);
};

exports.errorlog = (emsg) => {

    console.log(`${out.colorize("Error", "red")}: ${out.colorize(out.colorize(emsg, "red"), "bgYellowBright")}`);
};

