
const fs = require('fs');
var program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

var faker = require('faker');
/* Settings Files Directory */
let folderSettings = __dirname;

fileList = [];

readFilePreset = function (f) {
    var parsedFile = '';
    fs.readFile(folderSettings + '/' + f + '.json', 'utf-8',
        (err, data) => {
            
            repeat = (JSON.parse(data)).repeat;
            
            let results;
            
            results = data.match((/((\{{2}.+\}{2}))+/g));

            results.forEach((item) => {
                data = data.replace(item, faker.fake(item));
            })

            parsedFile = (JSON.parse(data)).entity;
            fs.writeFile(`p_preset/files/${new Date().toString()}-${f}.json`, JSON.stringify(parsedFile), 'utf8', () => {
                console.log('File saved');           
            });
        })
}

getFileListPreset = function () {
    folderSettings = folderSettings + '/generator_settings';
    fs.readdir(folderSettings, (err, files) => {
        files.forEach(file => {
            fileList.push(file.replace('.json', ''))

        });
    })
    setTimeout(() => startProgramPreset(fileList), 100);
}
function selectFile(list) {
    const questions = [
        {
            type: 'list',
            name: 'table',
            message: 'Select the file preset',
            choices: list,
            pageSize: 8
        }
    ];
    return inquirer.prompt(questions);
}

startProgramPreset = function (files) {
    homeScreen();
    selectFile(files).then((selectedFile) => {
        readFilePreset(selectedFile.table);
        console.log(chalk.green(`Selected file: ${selectedFile.table}`))
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
module.exports = {
    getFileListPreset: getFileListPreset
}
