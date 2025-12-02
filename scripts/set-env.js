const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Configure Angular `environment.ts` file path
const targetPath = path.join(__dirname, '../src/environments/environment.ts');
const targetPathProd = path.join(__dirname, '../src/environments/environment.prod.ts');

// `environment.ts` file structure
const envConfigFile = `export const environment = {
  production: false,
  googleBooksApiKey: '${process.env.GOOGLE_BOOKS_API_KEY}'
};
`;

const envConfigFileProd = `export const environment = {
  production: true,
  googleBooksApiKey: '${process.env.GOOGLE_BOOKS_API_KEY}'
};
`;

console.log('The file `environment.ts` will be written with the following content: \n');
console.log(envConfigFile);

fs.writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(`Angular environment.ts file generated correctly at ${targetPath} \n`);
    }
});

fs.writeFile(targetPathProd, envConfigFileProd, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(`Angular environment.prod.ts file generated correctly at ${targetPathProd} \n`);
    }
});
