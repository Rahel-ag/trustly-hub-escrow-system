const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.listen(process.env.PORT || 4000, () => {
  console.log('Server running on port 4000')
})
