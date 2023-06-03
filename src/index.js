const app = require('./app')
const config = require('./config')

const app_port = config.app.port

app.listen(app_port, () => {
    console.log(`Listening on http://127.0.0.1:${app_port}`)
})