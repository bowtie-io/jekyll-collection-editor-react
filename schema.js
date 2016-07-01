const COLLECTION_TYPE = window.collection_editor.collection

export function buildStateObject() {
  return {
    indicators: {
      requests: 0,
      error: null,
      warning: null
    },
    isStale: true,
    extension: '.md',
    fields: {
      attributes: {},
      body: ''
    },
    files: [ ],
    documents: [ ],
    currentDocumentName: null,
    preferredEditorMode: 'configuration',
    bodyEditorSelection: {
      anchor: { line: 0, ch: 0 },
      head: { line: 0, ch: 0 }
    },
    localReferences: {}
  }
}

var _id_increment = 0

export function buildDocumentObject(options, extension) {
  // New document should have name in YYYY-MM-DD-some-title.md

  if(!options.id)
    _id_increment += 1

  var name

  if(COLLECTION_TYPE == "_posts") {
    name = options.name ||
      (new Date().toISOString().slice(0, 10)) + '-new.md'
  }else{
    name = options.name || 'new.md'
  }

  return {
    id: options.id || _id_increment,
    name: name,
    sha: options.sha || null,
    content: options.content || null,
    originalName: options.originalName || name,
    originalContent: options.originalContent || options.content || null,
    staleContentKey: (new Date()).toISOString(), // modifications to the content from
                                                 // a source other than the content editor
    isNew: options.isNew || false,
    isModified: options.isModified || false,
    isRemoved: options.isRemoved || false
  }
}
