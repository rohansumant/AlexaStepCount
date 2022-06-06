const axios = require('axios');
const queryString = require('query-string');

async function renewAccessToken(creds) {
  const url = 'https://oauth2.googleapis.com/token';
  const body = queryString.stringify({
    'client_secret': creds.clientSecret,
    'grant_type': 'refresh_token',
    'refresh_token': creds.refreshToken,
    'client_id': creds.clientId
  });

  const headers = {'Content-type': 'application/x-www-form-urlencoded'};
  let result = null;
  try {
    result = await axios.post(url, body, {
      headers: headers
    });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
  if (!result) {
      throw new Error('Could not renew access token');
  } else {
    creds.accessToken = result.data.access_token;
  }
}


async function fetchStepCount(accessToken) {
  const url = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
  const dayInMilliSeconds = 24 * 3600 * 1000;
  process.env.TZ = 'America/Los_Angeles';
  const dateToday = new Date();
  const epochNow = +dateToday;
  const epochToday = +new Date(dateToday.toLocaleDateString()); 


  let body = JSON.stringify({
    "aggregateBy": [{
      "dataTypeName": "com.google.step_count.delta",
      "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
    }],
    "bucketByTime": { "durationMillis": dayInMilliSeconds },
    "startTimeMillis": epochToday,
    "endTimeMillis": epochNow
  });


  const headers = { 
    'Content-Type': 'application/json;encoding=utf-8',
    'Authorization': `Bearer ${accessToken}`
  };

  let result;
  try {
    result = await axios.post(url, body, {
      headers: headers
    });
  } catch (err) {
    console.log(`Error: ${err}`);
    throw err;
  }

  return result.data;
}

module.exports = {
  renewAccessToken,
  fetchStepCount
}
