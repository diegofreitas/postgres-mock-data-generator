
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
            let entinty = JSON.stringify((JSON.parse(data)).entity);
            repeat = (JSON.parse(data)).repeat;
            console.log(entinty);
            let results;
            results = entinty.match((/((\{{2}.+\}{2}))+/g));
            parsedFile = `[${generateData(data, results, entinty, repeat)}]`;
            if ( !fs.existsSync(`p_preset/files/${f}`)) {
                fs.mkdirSync(`p_preset/files/${f}`);
              }
            fs.writeFile(`p_preset/files/${f}/${new Date().toString()}-${f}.json`, parsedFile, 'utf8', () => {
                console.log(parsedFile);
                console.log(`\n FILE CREATED SUCCESSFULLY `);
                console.log(`\n path: p_preset/files/${f}`);
            });
        })
}

generateData = function (data,arrayMatch, ent, rep) {
    let chunk = '';
    for (let i = 0; i < repeat; i++) {
        ent = JSON.stringify((JSON.parse(data)).entity);
        arrayMatch.forEach((item) => {
            ent = ent.replace(item, faker.fake(item));
        })
        if (i > 0) {
            chunk += `,${ent}`;
        } else {
            chunk += `${ent}`;
        }
    }

    return chunk;

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
