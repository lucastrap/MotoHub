import '@testing-library/jest-dom'

// TextEncoder/TextDecoder sont des Web APIs absentes de JSDOM — on les polyfille depuis Node
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
