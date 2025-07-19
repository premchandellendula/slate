import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],       // your app's entry file
    format: ['cjs'],               // Node.js uses CommonJS
    target: 'node18',              // or your Node version
    sourcemap: true,
    clean: true,
    dts: false,                    // true if you want types (only useful for libraries)
    noExternal: [/@repo\/(common|db)/] // bundle local monorepo deps like @repo/common
})
