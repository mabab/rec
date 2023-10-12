import puppeteer from "puppeteer";
export const DEFAULT_VIEWPORT = {
  width: 1024,
  height: 640,
  deviceScaleFactor: 1,
};

export const LAUNCH_OPTIONS = {
  executablePath: puppeteer.executablePath(),
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    "--enable-features=AudioServiceOutOfProcess",
    "--autoplay-policy=no-user-gesture-required",
    "--headless=new",
  ],
  ignoreDefaultArgs: ["--mute-audio"],
  devtools: false,
  headless: true,
  dumpio: false,
  defaultViewport: DEFAULT_VIEWPORT,
};

export const STREAM_OPTIONS = {
  audio: true,
  video: true,
  videoConstraints: {
    mandatory: {
      width: {exact: DEFAULT_VIEWPORT.width},
      height: {exact: DEFAULT_VIEWPORT.height},
    },
  },
  audioBitsPerSecond: 192000,
  videoBitsPerSecond: 2500000,
  frameSize: 1000,
};

export const FRONTEND_URL = process.env.FRONTEND_URL;
export const BACKEND_URL = process.env.BACKEND_URL;
export const S3_PREFIX = "files";
export const S3_FULL_FILENAME = `record.webm`;
