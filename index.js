const fs = require('fs');
const http = require('./lib/http');
const http1 = require('http');
//Instanse
const uuid = require('uuid/v4');
//
const gost89 = require('gost89');
const jk = require('jkurwa');

const algos = gost89.compat.algos;
const Box = jk.Box;

require('./rand-shim.js');

async function send_command_to_server(send_file) {
    const text_buff = fs.readFileSync(send_file);

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

function write_command_to_xml() {
    fs.writeFileSync("test_command.xml", `{"Command":"Objects"}`);
}
/* Key read  */
function output(filename, data){
    if(typeof filename === 'string' && filename !== '-') {
        fs.writeFileSync(filename, data);
    }
}

function key_param_parse (key) {
    let pw;
    if (key.indexOf(':') !== -1) {
        pw = key.substr(key.indexOf(':') + 1);
        key = key.substr(0, key.indexOf(':'));
    }
    return {
        path: key,
        pw: pw,
    };
}

async function get_local_box (key, cert) {
    const param = {algo: algos(), query: http.query};
    if (key) {
        key = key_param_parse(key);
        param.keys = param.keys || [{}];
        param.keys[0].privPath = key.path;
        param.keys[0].password = key.pw;
    }
    if (cert) {
        param.keys[0].certPath = cert;
    }
    return new Box(param);
}

async function do_sc(box, inputF, outputF) {
    let input_file_to_code = fs.readFileSync(inputF);
    const pipe = [];
    pipe.push({
        op: 'sign',
        tax: false,
        detached: false,
        role: 'director',
        tsp: false
    });
    const tb = await box.pipe(input_file_to_code, pipe);
    output(outputF, tb);
    box.sock && box.sock.destroy();
}
/*End read key */
async function package_command() {
    let box;
    box = await get_local_box('Key-6.dat:tect4', '123.cer');
    await do_sc(box, 'comand.xml', 'comand_out.sig');
}

async function main() {
    //write_command_to_xml();
    await package_command();
    await send_command_to_server('comand_out.sig');
    console.log(uuid());
}
main();