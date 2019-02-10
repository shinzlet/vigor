const express = require('express')
    , app = express()
    , morgan = require('morgan')
    , exphbs = require('express-handlebars')
    , bodyParser = require('body-parser')
    , fuzzy = require('fuzzy-search');

// my  all time fav port 
const PORT = process.env.PORT || 8080;

// config shittttttttttt
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/search', (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
        // bitch you aint got queries
        next();
    } else {
        const query = req.query.query;

        const db = require('./database');
        const search = new fuzzy(Object.keys(db.symptoms), { caseSensitive: false });
        const result = search.search(query);

        res.render('search', {query: query, result: result});
    }
});

app.get('*', (req, res) => {
    res.send('404 bröthër');
});

app.listen(PORT, () => {
    console.log(`Hosting on ${PORT}`);
});