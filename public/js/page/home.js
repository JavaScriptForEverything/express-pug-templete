// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
// import WaveSurfer from '../plugins/wavesurfer/index.js'
// import { Snackbar } from '../module/components/index.js'
// import { $, toggleClass } from '../module/utils.js'
import * as wss from '../module/wss.js'
// import * as store from '../module/store.js'
// import * as webRTCHandler from '../module/webRTCHandler.js'
import * as elements from '../module/elements.js'

/* only handle eventhandler in this page, don't try to update UI here
		- Because this file run only after every files loaded, that means
			it override others code if tie, so use ui.js to update UI.
*/

const socket = io('/')
wss.registerSocketEvents(socket) 	// Handling all WebSocket events in wss.js file
// webRTCHandler.getLocalPreview()


