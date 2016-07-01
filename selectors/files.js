import { createSelector } from 'reselect'

function fileReferencesFromConfiguration(configuration, fileReferences){
  Object.keys(configuration).forEach(key => {
    const value = configuration[key]

    if(value && typeof(value) === 'object'){
      fileReferencesFromConfiguration(value, fileReferences)

    }else if(key.match(/[_-]path$/i) && typeof(value) === 'string'){
      fileReferences[value] = fileReferences[value] || 0
      fileReferences[value] += 1
    }
  })

  return fileReferences
}

const documentsSelector = state => state.documents

export const getFileReferenceMap = createSelector(documentsSelector,
  (documents) => (
    documents.reduce((map, document) => {
      const configuration = (document && document.content && document.content.configuration) ?
        document.content.configuration : {}

      return fileReferencesFromConfiguration(configuration, map)
    }, {})
  ))
