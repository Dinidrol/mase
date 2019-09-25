const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;

const client = new MongoClient('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(function(err, client){
    if(err){
        return console.log(err);
    }
    console.log("Connect successfully to server");

    app.locals.collection = client.db('admin').collection("test");

    app.listen(3000, function(){
        console.log("Server start");
    });

    let user = {name: "Tom", age: 23};
    app.locals.collection.insertOne(user, function(err, result){
        if(err){
            return console.log(err);
        }
        console.log(result.ops);
        client.close();
    });

});

const express = require("express");
const http = require('http');
//Instanse
const uuid = require('uuid/v4');
const coding_message = require('./lib/code_data');

const app = express();


let code_message;
let TaxObj
//let response_data;

require('./rand-shim.js');

function send_command_to_server(send_file, callback) {
    const text_buff = send_file;
    const req = http.request({
        host: '80.91.165.208',
        path: '/er/cmd',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': text_buff.length
        },
        method: 'POST'
    },
    (res) => {
        let chunks = [];
        res.on('data', (chunk) => {
            chunks.push(chunk);
        });
        res.on('end', e =>{
            callback(Buffer.concat(chunks));
        })
    });
    req.on('error', error =>{
        console.error(`Error status ${error}`);
    });
    req.write(text_buff);
    req.end();
}

async function main() {
    await coding_message.load_key('Key-6.dat:tect4', '123.cer');
    code_message = await coding_message.package_command('{"Command":"Objects"}');
    await send_command_to_server(code_message, (result) =>{
        TaxObj = JSON.parse(result);
        console.log(TaxObj.TaxObjects);
    });
}

app.get("/", function(request, response){
    //main();
    response.send(TaxObj);
});

app.get("/data", function(request, response){
    main();
    response.send();
    //const collection = req.app.locals.collection;
});



//main();