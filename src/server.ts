//server and main entry point

import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.text('get...'))
app.post('/', (c) => c.text('post...'))
app.put('/', (c) => c.text('put...'))
app.delete('/', (c) => c.text('delete...'))

//
// other routing methods. referenced from the docs - wont be used so far
//

/*
-- Custom HTTP method
app.on('PURGE', '/cache', (c) => c.text('PURGE Method /cache'))

-- Multiple Method
app.on(['PUT', 'DELETE'], '/post', (c) =>
  c.text('PUT or DELETE /post')
)

-- Multiple Paths
app.on('GET', ['/hello', '/ja/hello', '/en/hello'], (c) => c.text('Hello')
)
*/

const port = 3000

serve({fetch: app.fetch, port}, () => {
    console.log(`[SERVER]: Started on port: ${port}`)
    }
)