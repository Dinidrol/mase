const express = require("express");
const http = require('http');
//Instanse
const uuid = require('uuid/v4');
const coding_message = require('./lib/code_data');

const app = express();

let code_message;

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
    },(res) => {
        //console.log(`Status Code: ${res}`);
        res.on('data', (data) => {
            if(res.statusCode == 200){
                //console.log(JSON.parse(data));
                callback(data);
            }
            //callback(JSON.parse(d));
            //process.stdout.write(d);
        });
        res.on('end', e =>{
            //process.stdout.write(e);
            //console.log(`Status End: ${e}`);
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
        console.log(JSON.parse(result));
        return result;
    });
    //console.log(uuid());
}

app.get("/", function(request, response){
 main();
    response.send("<h2>Привет Express!</h2>");
    //response.send(data);
});

app.listen(3000);

//main();