/**
 * Main entry point for the application
 * Code create new worker every time if have in queue new lesson to record
 */

import { setTimeout } from "node:timers/promises";
import { Worker } from "node:worker_threads";
import classroomRecordQueue from "./storages/classroom-record-queue-storage.js";

// const WORKER_POOL_SIZE = process.env.WORKER_POOL_SIZE || 10;
const WORKER_POOL_SIZE = 1;
const workerSet = new Set();

(async function main() {
  console.log("Starting recorder service...");
  console.log(`Worker pool size: ${WORKER_POOL_SIZE}`);
  let isWaiting = false;
  let isSkipSetTimeout = false;

  while (true) {
    if (isSkipSetTimeout) {
      isSkipSetTimeout = false;
    } else {
      await setTimeout(1000);
    }

    if (workerSet.size >= WORKER_POOL_SIZE) {
      if (!isWaiting) {
        console.log("Waiting for workers to finish...");
      }
      isWaiting = true;
      continue;
    } else {
      isWaiting = false;
    }

    try {
      const data = await classroomRecordQueue.unshift();

      if (!data) {
        console.log("Queue is empty");
        continue;
      }

      const duration = data.timeEnd - Date.now();
      if (duration <= 0) {
        console.log(
          `Skip lesson=${data.lessonId} because timeEnd is in the past`
        );
        isSkipSetTimeout = true;
        continue;
      }

      console.log(`Creating recorder for lesson=${data.lessonId} ...`);
      const worker = new Worker("./app/worker.js", {
        workerData: {
          lessonId: data.lessonId,
          studentId: data.studentId,
          duration: duration,
        },
      });
      workerSet.add(worker);
      worker.on("error", async (error) => {
        console.error(error);
        workerSet.delete(worker);
        await classroomRecordQueue.deleteFromProcessing(data);
      });
      worker.once("exit", async () => {
        console.log(`Finish recorder for lesson=${data.lessonId}`);
        workerSet.delete(worker);
        await classroomRecordQueue.deleteFromProcessing(data);
      });
    } catch (error) {
      console.error(error);
    }
  }

  console.log("Stopping recorder service...");
})();
