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

function loveMachine(query, req, cb) {
    const db = require('./database');
    const symptoms = Object.keys(db.symptoms);
    
    const search = new fuzzy(symptoms, { caseSensitive: false });
    const tokens = query.split(' ');
    let mainResult = []

    tokens.forEach(token => {
        mainResult.push(...search.search(token))
    })

    cb(mainResult);
}

app.get('/', (req, res) => {
    res.render('home');
});

//TODO: tokenize the user input so they can enter multiple symptoms
app.get('/search', (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
        // bitch you aint got queries
        next();
    } else {
        loveMachine(req.query.query, req, (mainResult) => {
            const db = require('./database');
            const symptoms = Object.keys(db.symptoms);                                                                             

            // sum weight x number of occuruances squared 

            var render = {
                mainResult: mainResult,
                results: []
            }

            var scoring = {} // This will store conditon names as well as their sum weights and total occurences, like: {"common cold": {weight: 0.5, count: 2}}

            mainResult.forEach(key => { // For every symptom name matched by the fuzzy finder,
                conditions = db.symptoms[key] // We get the the possible conditions underneath it in the database

                for(var key in conditions) { // Then, we iterate over each condition in the list.
                    if(key in scoring) { // If our scoring object has already come across this condition, we add the weight and increment the occurence counter.
                        // add weight, counter
                        scoring[key].weight += conditions[key]
                        scoring[key].count++
                    } else { // If this is the first time we've come across this condition, we must intialize the object in the score counter.
                        scoring[key] = {weight: conditions[key], count: 1}
                    }
                }
            })

            // At this point in the code, scoring contains a dictionary with possible condition names, the weights attributed to them, and how many
            // times they showed up in the search (a measure of how likely the particular condition is)

            // So, we need to calculate the transformed score (which accounts for the number of occurences), and then sort them from most to least likely.

            for(var condition in scoring) {
                scoring[condition].finalScore = scoring[condition].weight * Math.pow(scoring[condition].count, 2)
            }

            var sortable = Object.keys(scoring).map(key => {
                return [key, scoring[key].finalScore]
            });

            sortable.sort((first, second) => {
                return second[1] - first[1]
            })
            console.log(sortable)
            sortable.forEach(diagnosis => {
                console.log(diagnosis)
                let cond = db.conditions[diagnosis[0]];
                console.log(cond)
                render.results.push({title: cond.title, info: cond.info})
            })

            // sum weight x number of occuruances squared 

            res.render('search', render);
        })
    }
});

app.get('*', (req, res) => {
    res.send('404 bröthër');
});

app.listen(PORT, () => {
    console.log(`Hosting on ${PORT}`);
});