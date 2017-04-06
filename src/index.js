const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ect = require('ect');
const difference = require('lodash/difference');
const recursiveReadDirCb = require('recursive-readdir');
const mkdirpCb = require('mkdirp');

const promisify = require('./promisify');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const recursiveReadDir = promisify(recursiveReadDirCb);
const mkdirp = promisify(mkdirpCb);

const projectTemplate = ({
  fileExtension = 'ect',
  templatePath,
  buildPath,
  params = {},
}) => Promise.resolve().then(() => {
  assert(typeof fileExtension === 'string', 'fileExtension must be a string');
  assert(typeof templatePath === 'string', 'templatePath must be a string');
  assert(typeof buildPath === 'string', 'buildPath must be a string');
  assert(params instanceof Object, 'params must be an object');

  assert(fileExtension.length > 0, 'fileExtension must not be empty');
  assert(templatePath.length > 0, 'templatePath must not be empty');
  assert(buildPath.length > 0, 'buildPath must not be empty');
  assert(fileExtension !== '.', 'fileExtension cannot be a dot');

  const extensionPattern = new RegExp(`\.${fileExtension}$`);
  const renderer = ect({
    root : templatePath,
    ext: `.${fileExtension}`,
  });

  const render = promisify(renderer.render.bind(renderer));

  return recursiveReadDir(templatePath)
    .then(files => files.map(fullPath => {
      let file = fullPath;

      if (file.indexOf(templatePath) === 0) {
        file = file.substr(templatePath.length);
      }

      return file.replace(/^\/+/, '');
    }))
    .then(files => files.map(file => [
      file.replace(extensionPattern, ''),
      extensionPattern.test(file)
    ]))
    .then(files => {
      const templateFiles = files.filter(([file, isTemplate]) => isTemplate)
        .map(([file]) => file);
      const missingFiles = difference(templateFiles, Object.keys(params));
      if (missingFiles.length) {
        throw new Error(
          `Params missing for template files: ${missingFiles.join(', ')}`
        );
      }
      return files;
    })
    .then(files => Promise.all(files.map(([file, isTemplate]) => (
      (isTemplate ?
        render(file, params[file]) :
        readFile(path.join(templatePath, file), { encoding: 'utf8' }))
          .then(data => [file, isTemplate, data])
    ))))
    .then(files => files.map(file => file.concat(path.join(buildPath, file[0]))))
    .then(files => Promise.all(files.map(
      ([file, isTemplate, data, filePath]) => mkdirp(path.dirname(filePath))
        .then(() => writeFile(filePath, data, { encoding: 'utf8' }))
        .then(() => file)
    )));
});

module.exports = projectTemplate;