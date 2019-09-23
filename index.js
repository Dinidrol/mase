const fs = require('fs');
const http1 = require('http');
//Instanse
const uuid = require('uuid/v4');
const coding_message = require('./lib/code_data');

require('./rand-shim.js');

async function send_command_to_server(send_file) {
    //const text_buff = fs.readFileSync(send_file);
    const text_buff = send_file;

    const req = http1.request({
        host: '80.91.165.208',
        path: '/er/cmd',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': text_buff.length
        },
        method: 'POST'
    },res => {
        console.log(`Status Code: ${res.statusCode}`);
        res.on('data', d => {
            process.stdout.write(d);
        });
        res.on('end', e =>{
            console.log(`Status End: ${e}`);
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
    let code_message = await coding_message.package_command('{"Command":"Objects"}');
    await send_command_to_server(code_message);
    console.log(uuid());
}
main();