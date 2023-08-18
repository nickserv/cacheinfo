# `cacheinfo`

Info about your JavaScript package manager cache sizes

## Usage

### CLI

```sh
npx cacheinfo
```

```
bower ... MB
bun ... MB
corepack ... MB
deno ... MB
npm ... MB
pnpm ... MB
yarn classic ... MB
yarn modern ... MB
```

### API

`cacheinfo` is a function that returns a `ReadableStream<[name: string, size: number]>` with the name and size (in bytes) of each package manager cache

```ts
import cacheinfo from "cacheinfo";

for await (const [name, size] of cacheinfo()) {
	// ...
}
```
