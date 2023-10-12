import { getStream, launch } from "puppeteer-stream";
import {
  DEFAULT_VIEWPORT,
  LAUNCH_OPTIONS,
  STREAM_OPTIONS,
} from "../constants.js";
import { createReadStream, createWriteStream, promises as fs } from "fs";
import { exec } from "child_process";
import { setTimeout } from "node:timers/promises";
import crypto from "node:crypto";

const TMP_FILE_PATH = `./app/video-${crypto.randomUUID()}.webm`;
const TMP_FILE_PATH_RESULT = `./app/video-${crypto.randomUUID()}.webm`;

/**
 * Open a classroom page
 *
 * @param classroomUrl {string} - url of the classroom
 * @returns {Promise<{page: Page, close: (function(): Promise<void>)}>} - page and function to close it
 */
async function openClassroomPage(classroomUrl) {
  const browser = await launch(LAUNCH_OPTIONS);
  const page = await browser.newPage();
  await page.goto(classroomUrl, {
    waitUntil: "load",
  });
  await page.setViewport(DEFAULT_VIEWPORT);
  return { page, close: () => browser.close() };
}

/**
 * Attach ffmpeg to the stream
 *
 * @param stream {ReadableStream} - stream to attach ffmpeg to
 * @returns {Promise<(function(): void)|*>} - function to destroy ffmpeg
 */
async function createFfmpeg() {
  console.log( "TMP_FILE_PATH: ", TMP_FILE_PATH);
  await fs.rm(TMP_FILE_PATH).catch(() => {});
  const ffmpeg = exec(`ffmpeg -y -i - ${TMP_FILE_PATH}`);

  return {
    ffmpeg,
    destroyFfmpeg: () => {
      return new Promise((resolve, reject) => {
        ffmpeg.on("close", (code) => {
            resolve();
        });
        ffmpeg.kill("SIGINT");
        ffmpeg.stdin.end();
      })
    },
  }
}

async function asyncExec(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * Record a classroom
 *
 * @param CLASSROOM_URL {string} - url of the classroom
 * @param duration {number} - duration of recording in milliseconds
 * @returns {Promise<{stream: ReadStream, destroy: function(): *|Promise<void | void>}>}
 */
async function record(CLASSROOM_URL, duration) {
  console.log('CLASSROOM_URL: ', CLASSROOM_URL);
  const { page, close } = await openClassroomPage(CLASSROOM_URL);
  const stream = await getStream(page, STREAM_OPTIONS);
  const file = createWriteStream(TMP_FILE_PATH);
  // const { ffmpeg, destroyFfmpeg } = await createFfmpeg();
  stream.pipe(file);


  return setTimeout(duration).then(async () => {
    // stream.unpipe(ffmpeg.stdin);
    await stream.destroy();
    file.close();
    await close();
    // await destroyFfmpeg();
    // await asyncExec('ls -la ./app');
    await asyncExec(`ffmpeg -y -i ${TMP_FILE_PATH} -c copy ${TMP_FILE_PATH_RESULT}`);
    await fs.rm(TMP_FILE_PATH);
    const newStream = createReadStream(TMP_FILE_PATH_RESULT);

    console.log('STOP: ', CLASSROOM_URL);
    return {
      stream: newStream,
      destroyStream: async () => {
        try {
          newStream.close();
          await fs.rm(TMP_FILE_PATH_RESULT);
        } catch (error) {
          console.error(error);
        }
      }
    };
  });
}

export default { record };
