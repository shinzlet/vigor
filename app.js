const express = require('express')
    , app = express()   
    , PORT = 8080;

app.get('/', (req, res) => {
    res.send('test');
});

app.listen(PORT, () => {
    console.log(`Hosting on ${PORT}`);
})