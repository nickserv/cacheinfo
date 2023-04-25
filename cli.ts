#!/usr/bin/env node
import prettyBytes from "pretty-bytes"
import cacheinfo from "./index.js"

cacheinfo().on("progress", (name, size) => console.log(name, prettyBytes(size)))
