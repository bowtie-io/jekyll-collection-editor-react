import { createSelector } from 'reselect'

import LoadingImage from '../images/loading.png'

const COLLECTION_TYPE = window.collection_editor.collection
const API_ROOT = window.collection_editor.api_root;

const documentsSelector = state => state.documents
const currentDocumentNameSelector = state => state.currentDocumentName
const localReferencesSelector = state => state.localReferences

// documentSort sorts newest first for `_posts` type, alphabetical asc for others
const documentSort = (documents) =>
  COLLECTION_TYPE == '_posts' ? documents.reverse() : documents

export const visibleDocumentsSelector = createSelector(documentsSelector,
  documents => ({ documents: documentSort(documents
                                          .filter(d => !d.isRemoved)
                                          .filter(d => !d.name.match(/^_/))
                                          .sort((x,y) => x.name.localeCompare(y.name)))
                }))

export const isModifiedSelector = createSelector(documentsSelector,
  (documents) => ({ isModified: !!documents.find(d => (d.isModified || d.isNew || d.isRemoved)) })
)

export const currentDocumentSelector = createSelector(
  visibleDocumentsSelector, currentDocumentNameSelector,
  (visibleDocuments, name) => ({
    currentDocument: visibleDocuments.documents.find(d => d.name == name) ||
      visibleDocuments.documents[0]
  })
)

export const currentDocumentBodySelector = createSelector(
  currentDocumentSelector,
  currentDocumentSelector => currentDocumentSelector.currentDocument.content.body
)

export const currentDocumentBodyPreviewSelector = createSelector(
  currentDocumentBodySelector, localReferencesSelector,
  (currentDocumentBody, localReferences) => {
    // ![Image](/uploads/2015-01-13-welcome-to-bowtie.md/IMG_3260.jpg)
    // => API_ROOT/projects/_/contents/uploads/2015-01-13-welcome-to-bowtie.md/IMG_3260.jpg
    return currentDocumentBody.replace(/(\[.*?\])\((\/.*?)\)/g,
        (match, p1, p2) => `${p1}(${localReferences[p2] || LoadingImage})`)
  }
)
