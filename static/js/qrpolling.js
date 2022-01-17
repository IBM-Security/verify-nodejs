var pollurl;

function processResponse() {
  if(req.readyState == 4) {
    if(req.status == 200) {
      var jsonResponse = JSON.parse(req.responseText);
      if(jsonResponse && jsonResponse.state != null) {
        var state = jsonResponse.state;
        if (state != 'DONE') {
            // re-poll after a short wait
            setTimeout(startPolling, 2000);
        } else {
          window.location="/login/logindone"
        }
      } else {
        // Error handling for invalid response
      }
     } else {
        // Error handling for non-200 response
     }
   } else {
        // Error handling for unexpected readyState
   }
 }

 function startPolling() {
  req = new XMLHttpRequest();
  req.onreadystatechange = processResponse;
  req.open("GET", pollurl, true);
  req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  req.setRequestHeader("Accept", "application/json;charset=UTF-8");
  req.send();
 }

 if (tmglobals.adaptive) {
   getSessionId().then( sessionId => {
     pollurl="/login/qrcheck?sess="+sessionId
     startPolling()
   });
 } else {
   pollurl="/login/qrcheck"
   startPolling()
 }
