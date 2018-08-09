const fs = require('fs');
var program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
/* Settings Files Directory */
let folderSettings = __dirname;

fileList = [];
printMessage = function () {
    console.log('hello world');
}

readFile = function (f) {
    fs.readFile(folderSettings+'/'+f+'.yml', 'utf-8',
        (err, data) => {
            console.log(data.replace((/((\{{2}.+\}{2}))+/g), 'asdsadas'))
        })
}

getFileList = function () {
    folderSettings = folderSettings+'/generator_settings';
    fs.readdir(folderSettings, (err, files) => {
        files.forEach(file => {
            fileList.push(file.replace('.yml', ''))
          
        });
    })
    setTimeout(()=>startProgram(fileList),100);
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
startProgram = function(files) {
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
    printMessage: printMessage,
    readFile: readFile,
     getFileList: getFileList
}