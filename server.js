const express = require("express");
const app = express();
const PORT = process.env.PORT = 3000;
let rp = require('request-promise');
let fs = require('fs');
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const keys = ['name', 'capital', 'flag','timestamp'];
function pick(obj, keys){
    let result = {};
    for(let i=0; i<keys.length; i++){
        if(keys[i] == 'flag'){
            let newstring = obj[keys[i]].replace('https','sftp')
            result[keys[i]] = newstring;
        }else if(keys[i] == 'timestamp'){
            result[keys[i]] = new Date();
        }
        else{
            result[keys[i]] = obj[keys[i]];
        }
    }
    return result;
}
app.get('/',function(req,res){
    res.sendfile('./index.html');
})

app.get('/countries/all',function async (req,res){
    var options = {
        uri: 'https://restcountries.eu/rest/v2/all',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    
    rp(options).then(function (countries) {
        let filterData = countries.map( country => pick(country,keys));
        res.json(filterData);
        })
        .catch(function (err) {
            res.json({'message' : 'Api call failed in Country'});
        });
});


app.post('/regions/search',function(req,res){
    let searchValue = req.body.searchItem;
    var options = {
        uri: 'https://restcountries.eu/rest/v2/region/'+searchValue,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    
    rp(options)
        .then(function (countries) {
        let filterData = countries.map( country => pick(country,keys));
        fs.writeFile('./result.txt', JSON.stringify(filterData), function (err) {
            if (err) throw err;               
            console.log('Results data written Received');
        }); 
        res.json(filterData);

        })
        .catch(function (err) {
            res.json({'message' : 'Api failed in region search'});
        });
});


app.listen(PORT,function(){
  console.log('Server is running at PORT:',PORT);
});