/**
 * Worker thread to record a classroom save webm file to s3 and send a webhook about it
 *
 * @param workerData.lessonId {number} - lesson id
 * @param workerData.studentId {number} - student id
 * @param workerData.duration {number} - duration of recording in milliseconds
 */

import recorder from "./services/recorder.js";
import s3 from "./services/s3.js";
import webhook from "./services/webhook.js";
import { FRONTEND_URL, S3_FULL_FILENAME } from "./constants.js";
import { workerData } from "node:worker_threads";
import process from 'node:process';

(async () => {
  try {
    const { lessonId, studentId, duration } = workerData;
    const CLASSROOM_URL = `${FRONTEND_URL}/user/${studentId}/classroom/incognito?fastboot=false`;

    console.log(" Recording ...", {
      lessonId,
      CLASSROOM_URL,
      duration,
      timestamp: Date.now(),
    });

    const { stream, destroyStream } = await recorder.record(
      CLASSROOM_URL,
      duration
    );

    console.log("Recorded!!!", {
      lessonId,
      CLASSROOM_URL,
      duration,
      timestamp: Date.now(),
    });

    console.log("Uploading...");
    const recordUrl = await s3.upload( stream, `${lessonId}/${S3_FULL_FILENAME}`);
    await destroyStream();
    console.log("Uploaded!");

    console.log("Sending WebHook...");
    await webhook.sendRecordReady(lessonId, recordUrl);
    console.log("WebHook sent!");
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();
