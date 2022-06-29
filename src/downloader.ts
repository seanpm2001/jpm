import util from 'node:util'
import { copyFileSync, createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { pipeline } from 'node:stream'
import fetch from 'node-fetch'
import { basename, join } from 'node:path'
import glob from './glob'

const streamPipeline = util.promisify(pipeline)

/**
 * Download target url and write location
 *
 * @export download
 * @param {string} url
 * @param {string} location
 * @return {*}  {Promise<void>}
 */
export async function download(url: string, location: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`unexpected response ${response.statusText} when calling to ${url}`)
  await streamPipeline(response.body, createWriteStream(location))
}

/**
 * Recursive lookup for jar file start from baseDir, and copy to targetDir
 *
 * @export copyJARToDir
 * @param {string} baseDir
 * @param {string} targetDir
 */
export async function copyJARToDir(baseDir: string, targetDir: string) {

  const matches = await glob(join(baseDir, '**/*.jar'))

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  for (const match of matches) {
    copyFileSync(match, join(targetDir, basename(match)))
  }
}