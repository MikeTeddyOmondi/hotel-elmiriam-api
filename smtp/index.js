const app = require("./src/app")
const {PORT} = require("./src/config")

app.listen(PORT, ()=>{
    console.log(`> Mail service listening on: ${PORT}`)
})