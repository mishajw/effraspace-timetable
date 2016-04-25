// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '745679047337-3195rmtu83g2oumm5r2agvm7k9hs1ne7.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
      {
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadCalendarApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult);
  return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load('calendar', 'v3', initEffraspaceCalendars);
}

function initEffraspaceCalendars() {
  var request = gapi.client.calendar.calendarList.list();
  request.execute(function(resp) {
    var calendars = resp.items;
    var esCalendars = [];

    for (var i = 0; i < calendars.length; i++) {
      if (calendars[i].summary.substring(0, 10) == "effraspace") {
        esCalendars.push(calendars[i].id);
      }
    }

    if (esCalendars.length < 2) {
      console.log("Too few effraspace calendars. Need two.");
      return;
    }

    fillWithCalendarId(esCalendars[0], "#table1");
    fillWithCalendarId(esCalendars[1], "#table2");
  });
}

function fillWithCalendarId(id, containerId) {
  var request = gapi.client.calendar.events.list({
    'calendarId': id,
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  });

  request.execute(function(resp) {
    var events = resp.items;

    var $container = $(containerId);

    for (var i = 0; i < events.length; i++) {
      $container.append(getEventHtml(events[i]));
    }
  });
}

function getEventHtml(e) {
  return $("<div></div>")
    .attr("class", "event")
    .append(
      $("<div></div>")
        .attr("class", "event-title")
        .text(e.summary)
    )
    .append(
      $("<div></div>")
        .attr("class", "event-date")
        .text(formatDate(e.start.dateTime))
     );
}

function formatDate(dateTime) {
  var date = new Date(dateTime);

  return date.getDate() + "/" + (date.getMonth() + 1) + ", " + date.getHours() + ":" + date.getMinutes();
}

