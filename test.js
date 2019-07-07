import fs from "fs";
import { diff } from ".";

const oldVersion = JSON.parse(fs.readFileSync("./test/diff-old.json"));
const newVersion = JSON.parse(fs.readFileSync("./test/diff-new.json"));

console.log(JSON.stringify(diff(oldVersion, newVersion)));