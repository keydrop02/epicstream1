/**
 * EpicStream Feedback -> Google Sheets
 *
 * SETUP:
 *   1. Create a Google Sheet (or reuse an existing one).
 *   2. In the sheet: Extensions > Apps Script, paste this file into Code.gs.
 *   3. Set the sheet id in SPREADSHEET_ID below (the long id in the sheet URL:
 *      https://docs.google.com/spreadsheets/d/<THIS IS THE ID>/edit).
 *   4. Run `setup` once (authorize when prompted) to create the headers.
 *   5. Deploy > Test deployments... optional; then Deploy > New deployment > Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   6. Copy the web app URL (ends in /exec) into the frontend env:
 *      NEXT_PUBLIC_FEEDBACK_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 *   7. Optional: open that /exec URL in a browser once while signed in to
 *      initialize the deployment.
 *
 * FEATURES:
 *   - Accepts JSON posted with Content-Type: text/plain, application/json,
 *     or application/x-www-form-urlencoded.
 *   - Uses a dedicated "Feedback" sheet; creates it and its headers if missing.
 *   - Locks writes so concurrent submissions cannot corrupt the sheet.
 *   - Validates the message and caps its length at MAX_CHARS.
 *   - Flushes the buffer after each write so rows appear immediately.
 *   - GET /exec?test=1 appends a sample row (handy for verifying the sheet).
 */

/** Paste your spreadsheet id here. Overridable at runtime via script properties. */
const SPREADSHEET_ID = "1S-rfOdjz-rudycSEwFHAD5roSvrBLch9r31wIUBgYWc";
const SHEET_NAME = "Feedback";
const COLUMNS = ["Timestamp", "Message", "Email"];
const MAX_CHARS = 2000;

/** Your deployed web app URL (used by keepWarm). */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwOAOWRVk7_Uhpf9MrIh6qiRKMnTypsKqNrN4p9dJeWWGFFDbwPbIYRWJlSdEmjIQu3Bg/exec";

/**
 * One-time setup: store the sheet id and make sure headers exist.
 */
function setup() {
  setSheetId_(SPREADSHEET_ID);
  ensureSheet_();
}

/**
 * Create a trigger that pings the web app every 5 minutes to prevent the
 * cold-start delay on feedback sends. Run once after deploying.
 */
function installKeepWarm() {
  ScriptApp.newTrigger("keepWarm").timeBased().everyMinutes(5).create();
}

/**
 * Lightweight ping so the web app stays warm. Called by the trigger.
 */
function keepWarm() {
  try {
    UrlFetchApp.fetch(WEB_APP_URL, { muteHttpExceptions: true });
  } catch (err) {
    // ignore: the app may be waking up; the next ping will succeed
  }
}

/**
 * OPTIONAL overrides of the defaults (run from the editor):
 *   setSheetId("you call with the id here")
 */
function setSheetId_(id) {
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", id);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.test === "1") {
    try {
      ensureSheet_().appendRow([new Date(), "Test submission from GET", "test@example.com"]);
      return json_({ ok: true, note: "Test row appended." });
    } catch (err) {
      return json_({ ok: false, error: String(err) });
    }
  }
  return json_({ ok: true, note: "EpicStream feedback endpoint is running." });
}

function doPost(e) {
  var payload = readPost_(e);
  if (!payload) {
    return json_({ ok: false, error: "Invalid or missing payload." });
  }

  var message = String(payload.message || "").trim();
  var email = String(payload.email || "").trim();

  if (!message) {
    return json_({ ok: false, error: "Message is required." });
  }
  if (message.length > MAX_CHARS) {
    return json_({ ok: false, error: "Message is too long." });
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return json_({ ok: false, error: "Too many submissions, please try again." });
  }

  try {
    ensureSheet_().appendRow([new Date(), message, email]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "Could not save your feedback: " + err });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Parse the post body regardless of how the client sent it:
 *   - text/plain         -> JSON string
 *   - application/json   -> JSON string
 *   - application/x-www-form-urlencoded -> key=value&...
 * Returns an object, or null if it could not be parsed.
 */
function readPost_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    if (e && e.parameter) return e.parameter; // form / GET-style fallback
    return null;
  }
  var raw = e.postData.contents;
  var type = (e.postData.type || "").toLowerCase();

  if (type.indexOf("json") !== -1 || type.indexOf("text") !== -1) {
    try {
      var obj = JSON.parse(raw);
      return obj && typeof obj === "object" ? obj : null;
    } catch (err) {
      return null;
    }
  }
  if (type.indexOf("form") !== -1) {
    return e.parameter || null;
  }
  // Unknown type: try JSON, then fall back to query parameters.
  try {
    var obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : null;
  } catch (err) {
    return e.parameter || null;
  }
}

/**
 * Resolve the target sheet: a sheet named SHEET_NAME, or the first sheet.
 * Creates SHEET_NAME (with headers) if the spreadsheet has no data sheet yet.
 */
function ensureSheet_() {
  var id = PropertiesService.getScriptProperties().getProperty("SHEET_ID") || SPREADSHEET_ID;
  var ss = SpreadsheetApp.openById(id);

  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0] ||
    ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}