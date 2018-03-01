const readline = require('readline');
const out = require('./out.js');
const model = require('./model.js');
const cmds = require('./cmd.js');


//Mensaje inicial
out.biglog('CORE Quiz', 'green');



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: out.colorize('quiz> ', 'blue'),

    completer: (line) => {
        const completions = 'h help add delete edit list test p play quit q credits'.split(' ');
        const hits = completions.filter((c) => c.startsWith(line));
        // show all completions if none found
        return [hits.length ? hits : completions, line];

    }
});

rl.prompt();

rl
    .on('line', (line) => {

        //Separacion de comando y argumento
        let args = line.split(" "); //Parte la linea por los espacios en blanco
        let cmd = args[0].toLowerCase().trim();

        switch (cmd) {
            case '':
                rl.prompt();
                break;
            case'h':
            case 'help':
                cmds.helpCmd(rl);
                break;

            case 'quit':
            case 'q':
                cmds.quitCmd(rl);
                break;

            case 'add':
                cmds.addCmd(rl);
                break;

            case 'list':
                cmds.listCmd(rl, args[1]);
                break;

            case 'show':
                cmds.showCmd(rl, args[1]);
                break;

            case 'delete':
                cmds.deleteCmd(rl, args[1]);
                break;

            case 'edit':
                cmds.editCmd(rl, args[1]);
                break;

            case 'test':
                cmds.testCmd(rl, args[1]);
                break;

            case 'p':
            case 'play':
                cmds.playCmd(rl);
                break;

            case 'credits':
                cmds.creditsCmd(rl);
                break;

            default:
                out.log(`Comando desconocido: '${out.colorize(cmd, 'red')}'`);
                out.log(`Use ${out.colorize('help', 'green')} para ver todos lo comandos disponibles.`);
                rl.prompt();
                break;
        }

    })
    .on('close', () => {
        out.log('Adios');
        process.exit(0);
    });

