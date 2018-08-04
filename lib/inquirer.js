const inquirer   = require('inquirer');
const files      = require('./files');


module.exports = {

    askDatabaseCredentials: () => {
      const questions = [
        {
          name: 'username',
          type: 'input',
          message: 'Enter the database username',
          default: '{{name.lastName}}',
          validate: function( value ) {
            if (value.length) {
              return true;
            } else {
              return 'Please enter your username .';
            }
          }
        },
        {
          name: 'password',
          type: 'password',
          message: 'Enter database password:',
          validate: function(value) {
            if (value.length) {
              return true;
            } else {
              return 'Please database password.';
            }
          }
        },
        {
            type: 'checkbox',
            name: 'ignore',
            message: 'Select the files and/or folders you wish to ignore:',
            choices: ['filelist'],
            default: ['node_modules', 'bower_components']
          }
      ];
      return inquirer.prompt(questions);
    },
  }