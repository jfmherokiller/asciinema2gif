/**
 * Created by jfmmeyers on 10/28/16.
 */
"use strict";
const shelljs = require("shelljs");
const fs_1 = require("fs");
const yargs = require("yargs");
const valid_url_1 = require("valid-url");
let depencyarray = [['convert', 'imagemagick'], ['gifsicle', 'gifsicle']];
let oldworkdir = process.cwd();
let asciinema_api = 'https://asciinema.org/api/asciicasts/';
for (let dep = 0; dep < depencyarray.length; dep++) {
    let parts = depencyarray[dep];
    let fileToCheck = parts[0];
    let dependecyname = parts[1];
    if (!shelljs.which(fileToCheck)) {
        shelljs.echo("Error this Tool Requires:" + dependecyname);
        shelljs.exit(1);
    }
}
let myargs = yargs.alias({ 'size': 's', 'speed': 'p', 'theme': 't', 'output': 'o', 'help': 'h' })
    .strict()
    .usage("Usage: $0 [options] \<asciinema_id|asciinema_api_url>")
    .choices('size', ['small', 'medium', 'big'])
    .describe('size', "")
    .choices('theme', ['asciinema', 'tango', 'solarized-dark', 'solarized-light', 'monokai'])
    .default('theme', 'tango')
    .describe('theme', "")
    .describe('speed', "Any integer (whole number) to multiply regular speed by")
    .default('speed', 1)
    .default('output', `${process.cwd()}/asciicast.gif`)
    .demand(1)
    .help('help')
    .argv;
//let newtempdir = mkdtempSync("asciinema2gif");
let IdOrPageOrJsonFile = myargs._[0];
if (!valid_url_1.isWebUri(IdOrPageOrJsonFile)) {
    let theurl = checkAndAppendArgs();
    checkUrlExists(theurl, function (test) {
        if (test) {
            let newtempdir = fs_1.mkdtempSync("asciinema2gif.");
            shelljs.cd(newtempdir);
            shelljs.exec(`phantomjs --ssl-protocol=any "${__dirname}/render.js" "${checkAndAppendArgs()}"`);
            shelljs.echo(">> Generating GIF…");
            shelljs.exec(`convert -delay 5 -loop 0 frames/*.png gif:- | gifsicle --colors=256 --delay=6 --optimize=3 --output='asciicast.gif'`);
            shelljs.mv("asciicast.gif", myargs.output);
            shelljs.cd(oldworkdir);
            shelljs.rm("-rf", newtempdir);
        }
    });
}
function checkAndAppendArgs() {
    return asciinema_api + IdOrPageOrJsonFile + `?size=${myargs.size}&theme=${myargs.theme}&speed=${myargs.speed}`;
}
function checkUrlExists(Url, callback) {
    require('http').request({
        method: 'HEAD',
        host: require('url').parse(Url).host,
        port: 80,
        path: require('url').parse(Url).pathname
    }, function (r) {
        callback(r.statusCode == 200);
    }).end();
}
//# sourceMappingURL=index.js.map