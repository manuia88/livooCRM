import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno del archivo .env.test
config({ path: resolve(process.cwd(), '.env.test') })

// Polyfill para fetch global
global.fetch = fetch
