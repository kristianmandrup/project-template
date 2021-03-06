"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
function entryDetails(config = {}) {
    const { resolve, populateEntry, isTemplate, info, error, validate } = config;
    if (!resolve) {
        error('entryDetails: missing resolve function as argument', {
            config
        });
    }
    if (!isTemplate) {
        error('entryDetails: missing isTemplate function as argument', {
            config
        });
    }
    return (entries) => {
        info('entry details');
        return entries.map((entry) => {
            info('add details', entry);
            entry = typeof entry === 'string' ? { filePath: entry } : entry;
            validate && validate.object(entry);
            const { 
            // templatesPath,
            filePath } = entry;
            entry.config = config;
            entry.filePath = resolve ? resolve.normalizePath(filePath) : filePath;
            if (!entry.filePath) {
                error('entryDetails: invalid filePath for entry', {
                    entry
                });
            }
            const fullExt = path.extname(entry.filePath);
            entry.fileExt = fullExt.slice(1); // such as js for any xyz.js file
            entry.opts = config.opts; // for convenience
            entry.name = path.basename(filePath, fullExt);
            entry.dirName = path.dirname(filePath);
            entry.isTemplate = validate && validate.function(isTemplate) ? isTemplate(entry.templatePath) : false;
            // make render more extensible: can have any type of side effect!
            entry.fileType = resolve.fileType ? resolve.fileType(entry) : 'file';
            entry.action = resolve.action ? resolve.action(entry) : 'copy';
            entry.fileName = [entry.name, entry.fileExt].join('.');
            const type = resolve.type;
            if (!(validate && validate.object(type))) {
                error('Invalid resolve.type', {
                    type: resolve.type
                });
            }
            if (validate && validate.object(type)) {
                // resolve file type
                entry.type = ['file', 'entity', 'folder'].reduce((acc, name) => {
                    const resolveType = type[name];
                    acc[name] = validate.function(resolveType) && resolveType(entry);
                    return acc;
                }, {});
                entry.params = resolve.params(entry);
            }
            // add any further entry customizations
            entry = validate && validate.function(populateEntry) ? populateEntry(entry) : entry;
            info('entry', entry);
            return entry;
        });
    };
}
exports.entryDetails = entryDetails;
//# sourceMappingURL=entry-details.js.map