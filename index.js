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

function inquireInputs(tableName) {
    tableMeta = metadata.get(tableName)
    columns = metadata.get(tableName).columns
    columnNames = columns.keys();
    let options = []
    for (let columnName of columnNames) {
        options.push({
            type: getOptionType(columns.get(columnName)),
            name: columnName,
            message: `input for ${columnName}`,
            choices: getChoices(columns.get(columnName))
        })
    }
    return inquirer.prompt(options);

}

function getChoices(columnMetadata) {
    return [];
}

function getOptionType(columnMetadata) {
    return 'input';
}


function generateDataForTable(tableName, options) {
    verifyInputArray(options).then((count) => {
        inquireNumInserts(count).then((inserts) => {
            for(let i = 0; i < inserts; i ++) {
                for (key in options) {
                    console.log(getValue(options[key], i))
                }
            }
        })
    })

}

function getValue(value, i) {
    if(value.indexOf('{{') > -1) {
        return faker.fake(value);
    }

    const values = value.split(',');
    if(values.length > 1) {
        return values[i];
    }

    return value;
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
            ]).then( result => {
                if(result.useCount) {
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
            ]).then( result => {
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
        if(count === 0){
            resolve({count:0});
        } else {
            resolve({count:count, columnName:columnName});
        }
        
    })

}


pgStructure({ database: 'positivo-local', user: 'postgres', password: 'fpf@1212', host: '10.60.70.59', port: 5433 }, ['schood'])
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