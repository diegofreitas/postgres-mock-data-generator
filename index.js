#!/usr/bin/env node
const files = require('./lib/files');
const inquirer = require('inquirer');

const program = require('commander');
const { prompt } = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const CLI = require('clui');
const Spinner = CLI.Spinner;

var pgStructure = require('pg-structure');
var faker = require('faker');

const Configstore = require('configstore');
const pkg = require('./package.json');
const conf = new Configstore(pkg.name);

const { Client } = require('pg');
var fs = require('fs');
// if (!fs.existsSync('./db.json')) {
//     console.log(chalk.red("db config file db.json is missing"))
//     console.log("Example", "{ \nuser: 'postgres',\nhost: 'localhost',\ndatabase: 'mydb',\npassword: '12dsu2j',\nport: 5432\n}")
//     process.exit(1)
// } 

var client;

clear();
console.log(
    chalk.blue(
        figlet.textSync('TestData', { horizontalLayout: 'full' })
    )
);

var metadata = {}

//run();

function selectTable() {
    const questions = [
        {
            type: 'list',
            name: 'table',
            message: 'Select the table to populate',
            choices: getTableList,
            pageSize: 8
        }
    ];
    return inquirer.prompt(questions);
}

function getTableList() {
    var tables = metadata.schemas.get('schood').tables;  // Map of Table objects.
    let tableList = [];
    for (let table of tables.values()) {
        tableList.push(table.fullName)
    }
    return tableList;
}

async function inquireInputs(tableName) {
    tableMeta = metadata.get(tableName)
    columns = metadata.get(tableName).columns
    columnNames = columns.keys();
    let options = []
    
    for (let columnName of columnNames) {
        const choicesValues = await getChoices(columns.get(columnName));
        options.push({
            type: getOptionType(columns.get(columnName)),
            name: columnName,
            message: `input for ${columnName}`,
            choices: choicesValues
        })
    }
    return inquirer.prompt(options);

}

async function getChoices(columnMetadata) {
    if (columns.get(columnMetadata.name).isForeignKey) {
        refTableName = columns.get(columnMetadata.name).foreignKeyConstraints.array[0].referencedTable.fullName
        refTable = metadata.get(refTableName)
        descriptiveColumns1 = refTable.columns.array[0]
        descriptiveColumns2 = refTable.columns.array[1]
        descriptiveColumns3 = refTable.columns.array[2]
        pkColumn = refTable.primaryKeyColumns.array[0];
        const res = await client.query(`SELECT ${pkColumn.name} as value, concat(${descriptiveColumns1.name}, ${descriptiveColumns2.name}, ${descriptiveColumns3.name})  as name, ${descriptiveColumns2.name} as short  from ${refTableName}`);
        return res.rows
    } else {
        return []
    }
}

function getOptionType(columnMetadata) {
    if (columnMetadata.isForeignKey) {
        return 'list'
    }

    return 'input';
}

function generateInserts(tableName, options, count) {
    for (let i = 0; i < count; i++) {
        let fields = []
        let values = []
        for (key in options) {
            //insert
            //sql
            fields.push(key);
            values.push(getValue(options[key], i))

        }
        console.log(`insert into ${tableName} (${fields})  values (${values})`)
    }

}


function generateDataForTable(tableName, options) {
    verifyInputArray(options).then((count) => {
        inquireNumInserts(count).then((inserts) => {
            generateInserts(tableName, options, inserts)
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'sessionName',
                    message: `Save this session as:`,
                    validate: (value) => {
                        if (value.length > 0) {
                            return true;
                        } else {
                            return "You must provide a name!"
                        }
                    }
                }
            ]).then(result => {
                session = {
                    table: tableName,
                    count: inserts,
                    options: options
                }
                files.saveSession(result.sessionName, JSON.stringify(session), (error) => {
                    console.log(error);
                })
            });
        })
    })

}

function getValue(value, i, columnName) {
    let parsedValue = value;
    if (value.indexOf('$') > -1) {
        parsedValue = Number(value.replace('$', '')) + i
    }
    if (value.indexOf('{{') > -1) {
        parsedValue = faker.fake(value);
    }

    const values = value.split(',');
    if (values.length > 1) {
        parsedValue = values[i];
    }
    if (isNaN(Number(parsedValue))) { //TODO verificar o tipo usando metadados
        parsedValue = `'${parsedValue}'`
    }
    return parsedValue;
}


function inquireNumInserts(opt) {
    return new Promise((resolve, reject) => {
        if (opt.count) {
            inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'useCount',
                    message: `The value for ${opt.columnName} is an array with length ${opt.count}. Would you like to insert ${opt.count} tuples in the table?`,
                    default: true
                }
            ]).then(result => {
                if (result.useCount) {
                    resolve(opt.count)
                } else {
                    reject(`The column ${opt.columnName} has ${opt.count} elements, but you want to insert a different number of elements in the table.`)
                }
            });
        } else {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'count',
                    message: `How may items would you like to insert in the table?`,
                    default: 1
                }
            ]).then(result => {
                resolve(Number(result.count));
            });
        }
    });


}

function verifyInputArray(options) {
    return new Promise((resolve, reject) => {
        let optValue;
        let count = 0;
        let columnName = '';
        for (key in options) {
            optValue = options[key].split(',');
            if (optValue.length > 1) {
                count = optValue.length;
                columnName = key;
                break;
            }
        }
        if (count === 0) {
            resolve({ count: 0 });
        } else {
            resolve({ count: count, columnName: columnName });
        }

    })

}

program
    .command('session <file>')
    .alias('s')
    .description('Load a session configuration.')
    .action((file) => {
        connect()
        const session = files.loadSession(file);
        generateInserts(session.table, session.options, session.count );
    });

program
    .command('interactive')
    .alias('i')
    .description('Start interactive mode')
    .action(() => {
        connect();
        pgStructure({ database: program.database, user: program.user, password: program.password, host: program.host, port: program.port}, ['schood','schoolar'])
            .then((db) => {



                // Basic

                metadata = db;
                // List of table names


                // Long chain example for:
                // public schema -> cart table -> contact_id column -> foreign key constraints of contact_id.
                //var constraints = db.get('schood.bracelet.trackable_id').foreignKeyConstraints;
                //console.log(constraints);
                //var sameName = db.schemas.get('schood').tables.get('bracelet').columns.get('trackable_id').foreignKeyConstraints;
                //console.log(sameName);
                // Many to many relation. Returns cart_line_item for cart --< cart_line_item >-- product
                //var joinTable = [...db.get('schood.area_category').m2mRelations.values()];    // See JS Map  on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
                //console.log(joinTable[1].sourceTable.name)
                //console.log(joinTable[1].joinTable.name)
                //console.log(joinTable[1].targetTable.name)
                selectTable().then((selectedTable) => {
                    console.log(chalk.green(`Selected table: ${selectedTable.table}`))
                    inquireInputs(selectedTable.table).then(options => {
                        generateDataForTable(selectedTable.table, options)
                    }).catch(error => {
                        console.log(chalk.red(error))
                    });
                }).catch(error => {
                    console.log(chalk.red(error))
                });
            })
            .catch(err => console.log(err.stack));

    });

    function connect() {
        client = new Client({
            user: program.user,
            host: program.host,
            database: program.database,
            password: program.password,
            port: program.port,
        });

        client.connect()
    }

    program
    .version('0.0.3')
    .description('Test data generation made easy')
    .option('-u, --user <n>', 'Dababase user' )
    .option('-h, --host <h>', 'Host name' )
    .option('-d, --database <d>', 'Dababase name' )
    .option('-s, --password <d>', 'Password' )
    .option('-p, --port <p>', 'Port' )
    .parse(process.argv);

    

/*




program
    .version('0.0.1')
    .description('Test data generation made easy');

    const questions = [
        {
          type : 'input',
          name : 'firstname',
          message : 'Enter firstname ...'
        },
        {
          type : 'input',
          name : 'lastname',
          message : 'Enter lastname ...'
        },
        {
          type : 'input',
          name : 'phone',
          message : 'Enter phone number ...'
        },
        {
          type : 'input',
          name : 'email',
          message : 'Enter email address ...'
        },
        {
            type: 'checkbox',
            name: 'ignore',
            message: 'Select the files and/or folders you wish to ignore:',
            choices: ['filelist'],
            default: ['node_modules', 'bower_components']
          }
      ];

program
    .command('addContact')
    .alias('a')
    .description('Add a contact')
    .action((firstname, lastname, phone, email) => {
        prompt(questions).then(answers => {
            console.log(answers);
            
        } )
    });

program
    .command('getContact <name>')
    .alias('r')
    .description('Get contact')
    .action(name => { name: "NAme"});
*/

//program.parse(process.argv);