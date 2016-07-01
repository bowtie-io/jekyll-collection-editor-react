import { createSelector } from 'reselect'

const fieldsSelector = state => state.fields
const preferredEditorModeSelector = state => state.preferredEditorMode

export const configurationEditorModeAvailableSelector = createSelector(fieldsSelector,
    (fields) => (fields && fields.attributes && Object.keys(fields.attributes).length > 0))

export const editorModeSelector = createSelector(preferredEditorModeSelector, configurationEditorModeAvailableSelector,
    (preferredEditorMode, configurationEditorModeAvailable) => (configurationEditorModeAvailable ? preferredEditorMode : 'body'))
