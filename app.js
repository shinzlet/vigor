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
        const symptoms = Object.keys(db.symptoms);

        const search = new fuzzy(symptoms, { caseSensitive: false });
        const mainResult = search.search(query);

        // sum weight x number of occuruances squared 

        var render = {
            query: query,
            mainResult: mainResult,
            results: []
        }

        if (Object.keys(mainResult).length > 1) {
            console.log('multiple repsonses');
            mainResult.forEach((condition) => {
                render.results.push({title: condition, info: 'test'});
            });
            render['multipleSymptoms'] = true;
        } else {
            console.log('nope');
            render['multipleSymptoms'] = false;
        }

        console.log(render);

        // sum weight x number of occuruances squared 

        res.render('search', render);
    }
});

app.get('*', (req, res) => {
    res.send('404 bröthër');
});

app.listen(PORT, () => {
    console.log(`Hosting on ${PORT}`);
});