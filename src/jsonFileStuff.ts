/**
 * Created by jfmmeyers on 11/7/16.
 */
import * as shelljs from "shelljs";
import {mkdtempSync, writeFileSync} from "fs";
import {CreateWebfile} from "../webfile/mywebfile";
import {resolve} from "path";
import {ChildProcess} from "child_process";


export function JsonCode(JsonFile, myargs, workdir) {
  let fullpath = resolve(JsonFile);
  let newtempdir = mkdtempSync("asciinema2gif.");
  shelljs.cd(newtempdir);
  shelljs.cp(fullpath, "file.json");
  let height = require(fullpath).height;
  let width = require(fullpath).width;
  writeFileSync("temp.html", CreateWebfile(fullpath, myargs, width, height));
  openServer(function () {
    shelljs.echo(">> Generating GIF…");
    shelljs.exec(`convert -delay 5 -loop 0 frames/*.png gif:- | gifsicle --colors=256 --delay=6 --optimize=3 --output='asciicast.gif'`);
    shelljs.mv("asciicast.gif", myargs.output);
    shelljs.cd(workdir);
    shelljs.rm("-rf", newtempdir)
  });
}
function openServer(finished) {
  let hserv = shelljs.exec(`"${__dirname}/../node_modules/.bin/http-server" -p 8096`, {async: true}) as ChildProcess;
  shelljs.exec(`phantomjs --ssl-protocol=any "${__dirname}/../rendering/RenderIdOrUrl.js" "http://localhost:8096/temp.html"`);
  hserv.kill();
  finished()
}