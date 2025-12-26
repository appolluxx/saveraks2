
/**
 * GOOGLE APPS SCRIPT BACKEND (SaveRaks 2.0)
 * Integrated with LINE Messaging API
 */

// --- LINE CONFIGURATION ---
// 1. Get this from: LINE Developers Console > Messaging API Tab > Channel access token (Issue)
const LINE_CHANNEL_ACCESS_TOKEN = "8fc086eef2185fa8d4d4b84d97cf6296"; 

// 2. Get this from: LINE Developers Console > Messaging API Tab > Your user ID (Starts with 'U')
const TARGET_LINE_USER_ID = "hallorem"; 

const LINE_CHANNEL_ID = "2008784571";
const LINE_CHANNEL_SECRET = "8fc086eef2185fa8d4d4b84d97cf6296";

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    switch(action) {
      case 'REGISTER': return handleRegister(contents, ss);
      case 'LOGIN': return handleLogin(contents, ss);
      case 'LOG_ACTIVITY': return handleLogActivity(contents, ss);
      case 'GET_LEADERBOARD': return handleGetLeaderboard(ss);
      case 'GET_ADMIN_STATS': return handleGetAdminStats(ss);
      default: return createResponse({ error: "Invalid Action" });
    }
  } catch (err) {
    return createResponse({ error: err.toString() });
  }
}

function handleLogActivity(data, ss) {
  const logSheet = ss.getSheetByName("Activity_Logs") || ss.insertSheet("Activity_Logs");
  const userSheet = ss.getSheetByName("Users") || ss.insertSheet("Users");
  const userData = userSheet.getDataRange().getValues();
  
  let userRow = -1;
  for(let i=1; i<userData.length; i++) {
    if(userData[i][0] === data.userId) { userRow = i + 1; break; }
  }
  
  if(userRow === -1) return createResponse({ error: "User not found" });

  // Trigger LINE Alert for Hazards or Full Bins
  if (data.category === "hazard" || data.category === "full_bin" || data.category === "map_report") {
    const alertMsg = `🚨 SaveRaks Alert!\n------------------\nType: ${data.category.toUpperCase()}\nItem: ${data.label}\nBy User: ${data.userId}\n\nReview needed in Admin Console.`;
    sendLinePushMessage(TARGET_LINE_USER_ID, alertMsg);
  }

  const currentPoints = parseInt(userData[userRow-1][2] || 0);
  const newPoints = currentPoints + parseInt(data.points || 0);
  userSheet.getRange(userRow, 3).setValue(newPoints); 
  userSheet.getRange(userRow, 5).setValue(newPoints); 

  logSheet.appendRow([
    new Date(), 
    data.userId, 
    data.category, 
    data.label, 
    data.points, 
    data.aiData || "{}"
  ]);

  return createResponse({ success: true, newTotalPoints: newPoints });
}

function sendLinePushMessage(to, message) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || LINE_CHANNEL_ACCESS_TOKEN.includes("PASTE_YOUR")) {
    console.log("CRITICAL: LINE Access Token is missing. Get it from Messaging API tab in LINE Console.");
    return;
  }
  
  try {
    const url = "https://api.line.me/v2/bot/message/push";
    const payload = {
      "to": to,
      "messages": [{ "type": "text", "text": message }]
    };
    const options = {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + LINE_CHANNEL_ACCESS_TOKEN
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };
    const response = UrlFetchApp.fetch(url, options);
    console.log("LINE Response: " + response.getContentText());
  } catch (e) {
    console.log("Error sending LINE push: " + e.toString());
  }
}

// Helper functions (remain same)
function handleRegister(data, ss) {
  const sheet = ss.getSheetByName("Users") || ss.insertSheet("Users");
  const userData = sheet.getDataRange().getValues();
  for(let i=1; i<userData.length; i++) {
    if(userData[i][0] === data.schoolId) return createResponse({ error: "ID already registered" });
  }
  const newUser = [data.schoolId, data.name, 0, data.role || "STUDENT", 0, 1];
  sheet.appendRow(newUser);
  return createResponse({ user: formatUser(newUser) });
}

function handleLogin(data, ss) {
  const sheet = ss.getSheetByName("Users") || ss.insertSheet("Users");
  const userData = sheet.getDataRange().getValues();
  for(let i=1; i<userData.length; i++) {
    if(userData[i][0] === data.schoolId) return createResponse({ user: formatUser(userData[i]) });
  }
  return createResponse({ error: "User not found" });
}

function handleGetLeaderboard(ss) {
  const sheet = ss.getSheetByName("Users");
  if(!sheet) return createResponse({ leaders: [] });
  const data = sheet.getDataRange().getValues();
  const leaders = data.slice(1).filter(row => row[3] !== "ADMIN").map(formatUser).sort((a, b) => b.points - a.points).slice(0, 10);
  return createResponse({ leaders });
}

function handleGetAdminStats(ss) {
  const userSheet = ss.getSheetByName("Users");
  return createResponse({
    totalStudents: userSheet ? userSheet.getLastRow() - 1 : 0,
    totalPoints: 0,
    pendingReports: 0, 
    carbonSaved: 0
  });
}

function formatUser(row) {
  return { schoolId: row[0], name: row[1], points: parseInt(row[2] || 0), role: row[3], xp: parseInt(row[4] || 0), level: parseInt(row[5] || 1) };
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
