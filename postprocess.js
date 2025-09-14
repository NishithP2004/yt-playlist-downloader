import fs from "node:fs"
import NodeID3 from "node-id3"
import path from "node:path"

const files = fs.readdirSync("music")

for (let file of files) {
    try {
        console.log(`[+] Processing file ${files.indexOf(file) + 1} / ${files.length}`)
        const tags = {
            title: path.parse(file).name
        }

        NodeID3.update(tags, `music/${file}`)
    } catch(err) {
        console.error("[!] Error updating metadata for %s: %s", file, err.message)
        continue;
    }
}