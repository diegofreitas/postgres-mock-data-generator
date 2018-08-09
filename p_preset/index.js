
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

readFile = function (f) {
    var parsedFile = '';
    console.log('>>>>',folderSettings);
    fs.readFile(folderSettings+'/'+f+'.json', 'utf-8',
        (err, data) => {
            fs.writeFile(`p_preset/files/${new Date().toString()}-${f}.json`, parsedFile, 'utf8', ()=>{
                console.log('File saved')
            });
        })
}

getFileList = function () {
    folderSettings = folderSettings+'/generator_settings';
    fs.readdir(folderSettings, (err, files) => {
        files.forEach(file => {
            fileList.push(file.replace('.json', ''))
          
        });
    })
    setTimeout(()=>startProgramPreset(fileList),100);
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

startProgramPreset = function(files) {
    homeScreen();
    selectFile(files).then((selectedFile) => {
        console.log(selectedFile);
        readFile(selectedFile.table);
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
    getFileList: getFileList
}
