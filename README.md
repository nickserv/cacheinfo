# `cacheinfo`

Info about your JavaScript package manager cache sizes

## Usage

### CLI

```sh
npx cacheinfo
```

```
npm ... MB
pnpm ... MB
yarn ... MB
berry ... MB
```

### API

`cacheinfo` is a function that returns a `ReadableStream<[string, number]>` with the name and size (in bytes) of each package manager cache

```ts
import cacheinfo from "cacheinfo"

for await (const [name, size] of cacheinfo()) {
  // ...
}
```
