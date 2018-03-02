import * as path from 'path'

export function entryDetails(config: any = {}) {
  const {
    resolve,
    populateEntry,
    isTemplate,
    info
  } = config
  return (files: string[]) => {
    info('entry details')
    return files.map((entry: any) => {
      info('add details', entry)
      const {
        filePath
      } = entry
      entry.config = config
      entry.filePath = resolve.normalizePath(filePath)
      entry.fileExt = path.extname(entry.filePath).slice(1) // such as js for any xyz.js file

      // resolve file type
      entry.type = {
        opts: config.opts, // for convenience
        name: path.basename(filePath),
        dirName: path.dirname(filePath),
        type: {
          file: resolve.type.file(entry),
          entity: resolve.type.entity(entry),
          folder: resolve.type.folder(entry),
        },
        isTemplate: isTemplate(entry.templatePath)
      }
      entry.fileName = [entry.name, entry.fileExt].join('.')
      entry.params = resolve.params(entry)

      // add any further entry customizations
      entry = typeof populateEntry === 'function' ? populateEntry(entry) : entry

      info('entry', entry)
      return entry
    })
  }
}