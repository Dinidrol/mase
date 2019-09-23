const fs = require('fs');
const http = require('./http');
const gost89 = require('gost89');
const jk = require('jkurwa');

const algos = gost89.compat.algos;
const Box = jk.Box;
let box;

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

async function do_sc(box, inputF) {
    let input_file_to_code = inputF;
    const pipe = [];
    pipe.push({
        op: 'sign',
        tax: false,
        detached: false,
        role: 'director',
        tsp: false
    });
    const tb = await box.pipe(input_file_to_code, pipe);
    //box.sock && box.sock.destroy();
    return tb;
}

var load_key = async function(key, certificate){
    box = await get_local_box(key, certificate);
}

var package_command = async function(command) {
    return await do_sc(box, command);
}

module.exports = {load_key, package_command};