"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getData(name, config = {}) {
    const { srcMap, type, entry, options } = config;
    const { error } = options;
    const src = srcMap[type.file] || srcMap[type.folder] || srcMap[type.entity];
    if (typeof src === 'string')
        return src;
    if (typeof src === 'function')
        return src(entry);
    error(`Invalid ${name} data src`, {
        type,
        src,
        srcMap
    });
}
function transformData(entry) {
    const { data, type, } = entry;
    const { prependWith, appendWith, error } = entry.config;
    const prependData = getData('prepend', { src: prependWith, type, entry, error });
    const appendData = getData('append', { src: appendWith, type, entry, error });
    let fileData = [];
    prependData && fileData.push(prependData);
    fileData.push(data);
    appendData && fileData.push(appendData);
    return fileData.join('\n');
}
exports.transformData = transformData;
//# sourceMappingURL=transform.js.map