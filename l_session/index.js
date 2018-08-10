const fs = require('fs');
var program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

var faker = require('faker');
/* Settings Files Directory */
let folderSettings = __dirname;

// faker.setLocale("pt_BR");
fileList = [];
readFile = function (f) {
    var parsedFile = '';
    console.log(folderSettings+'/generator_settings/'+f+'.json');
    fs.readFile(folderSettings+'/'+f+'.json', 'utf-8',
        (err, data) => {
            console.log(data);
            data = JSON.parse(data);
            generateInserts(data.table, data.options, data.count, f)
        })
}

getFileList = function () {
    folderSettings = folderSettings+'/generator_settings';
    fs.readdir(folderSettings, (err, files) => {
        files.forEach(file => {
            fileList.push(file.replace('.json', ''))
          
        });
    })
    setTimeout(()=>startProgramSession(fileList),100);
}
function selectFile(list) {
    const questions = [
        {
            type: 'list',
            name: 'table',
            message: 'Select the file session',
            choices: list,
            pageSize: 8
        }
    ];
    return inquirer.prompt(questions);
}
startProgramSession = function(files) {
    homeScreen();
    selectFile(files).then((selectedFile) => {
        console.log(selectedFile);
        readFile(selectedFile.table);
        console.log(chalk.green(`Selected file session: ${selectedFile.table}`))
    }).catch(error => {
        console.log(chalk.red(error))
    });
}


homeScreen = function () {
        clear();
    console.log(
        chalk.blue(
            figlet.textSync('TestData', { horizontalLayout: 'full' })
        )
    );
}

function generateInserts(tableName, options, count, file) {   
    let querys = [];
    for (let i = 0; i < count; i++) {
        let fields = []
        let values = []
        for (key in options) {
            //insert
            //sql
            fields.push(key);
            values.push(getValue(options[key], i))

        }
        let query = `insert into ${tableName} (${fields})  values (${values})`
        console.log(query);
        querys.push("\n"+query);
    }   
    if ( !fs.existsSync(`l_session/sqls/${file}`)) {
        fs.mkdirSync(`l_session/sqls/${file}`);
      }
        fs.writeFile(`l_session/sqls/${file}/${new Date().toString()}-${file}.sql`, querys.join(';'), 'utf8', ()=>{
        console.log(`\n FILE CREATED SUCCESSFULLY `);
        console.log(`\n path: l_session/sqls/${file}`);

    });

}
function getValue(value, i, columnName) {
    console.log(value);
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

module.exports = {
     getFileList: getFileList
}