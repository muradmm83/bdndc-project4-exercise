const express = require('express');
const bodyParser = require('body-parser');
const hex2ascii = require('hex2ascii');

const Pool = require('./mempool');


const pool = new Pool();
const port = 8000;
const app = express();

app.use(bodyParser.json());

app.post('/requestValidation', (req, res) => {
    let address = req.body.address;

    res.json(pool.addRequestValidation(address));
});

app.listen(port, () => console.log(`running on port ${port}`));