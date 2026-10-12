// Google Apps Script for the RSVP sheet (see README, "RSVP -> Google Sheets").
// Paste this into Extensions > Apps Script in the sheet. Plain ASCII on purpose,
// so nothing is altered when it is copied.

var COLUMNS = ["submittedAt", "code", "invitation", "attending",
  "attendingGuests", "attendingCount", "dietary", "message"];

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("SECRET");
  if (!secret || data.secret !== secret) {
    return ContentService.createTextOutput("forbidden");
  }

  var sheet = SpreadsheetApp.getActive().getSheetByName("RSVPs");
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
  sheet.appendRow(COLUMNS.map(function (key) { return data[key]; }));

  // Optional: an email for each reply. A failed email never loses the row.
  var notify = props.getProperty("NOTIFY_EMAIL");
  if (notify) {
    try {
      var answer = data.attending
        ? "yes, " + data.attendingCount + " coming (" + data.attendingGuests + ")"
        : "cannot make it";
      var subject = "RSVP: " + data.invitation + " - " + answer;
      var body = [
        "Invitation: " + data.invitation + " (" + data.code + ")",
        "Answer: " + answer,
        "Dietary: " + (data.dietary || "none given"),
        "Message: " + (data.message || "none")
      ].join("\n");
      MailApp.sendEmail(notify, subject, body);
    } catch (error) {
      console.error(error);
    }
  }
  return ContentService.createTextOutput("ok");
}

// Run this once from the editor so Google asks for permission to edit the
// sheet and send email before the first real RSVP arrives.
function authorize() {
  SpreadsheetApp.getActive().getSheetByName("RSVPs");
  MailApp.getRemainingDailyQuota();
}
