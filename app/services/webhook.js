import fetch from "node-fetch";
import { BACKEND_URL } from "../constants.js";

/**
 * Send data to webhook
 * @param url {string}
 * @param body {Object}
 * @returns {Promise<void>}
 */
async function send(url, body) {
  console.log("WebHook url: ", url, "body: ", body)
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Allright recorder",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((json) => console.log("WebHook success: ", json))
    .catch((e) => {
      console.log("WebHook Error::", e);
    });
}

/**
 * Send record ready webhook
 *
 * @param lessonId {number}
 * @param recordUrl {string}
 * @returns {Promise<void>}
 */
async function sendRecordReady(lessonId, recordUrl) {
  const url = `${BACKEND_URL}/lessons/${lessonId}/record-ready`;

  const body = {
    lesson_id: lessonId,
    record_url: recordUrl,
    timestamp: Number(new Date()),
  };

  return send(url, body);
}

export default { sendRecordReady };
