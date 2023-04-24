// NOTE: Always use the latest version of gmail.js from
// https://github.com/KartikTalwar/gmail.js
// don't mess up too bad if we have several gmail.js-based
// extensions loaded at the same time!
window._gmailjs = window._gmailjs || new Gmail();

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
  if (!window._gmailjs) {
      return;
  }

  clearInterval(loaderId);
  startExtension(window._gmailjs);
}, 100);

function startExtension(gmail) {
  /*
    Use the provided 'jQuery' if possible, in order to avoid conflicts with
    other extensions that use $ for other purposes.
  */
  var $;
  if (typeof localJQuery !== 'undefined') {
      $ = localJQuery;
  } else if (typeof jQuery !== 'undefined') {
      $ = jQuery;
  }

  // For debug
  // console.log('Hello,', gmail.get.user_email())

  gmail.observe.on('compose', function(compose, type) {
    // type can be compose, reply or forward
    console.log('api.dom.compose object:', compose, 'type is:', type );  // gmail.dom.compose object

    // Quick hack to ensure the toolbar is loaded before we attempt to find it
    setTimeout(function () {
      // Get the parent div of the Discard button
      var parentDiv = $( compose.$el[0] ).find( 'div[aria-label^=Discard]' ).parent().parent().get(0);

      console.log('Discard parent:', parentDiv );

      // Create the timer div
      var $timer = $('<div>', {
        class: 'compose-timer',
        'data-starttime': (new Date()).toJSON()
      });
      $timer.html('0:00');

      // Add the timer div to the relevant parent
      $(parentDiv).prepend($timer);
    },1000);
  });

  // Once loaded, ensure that all stopwatches are updated
  gmail.observe.on('load', function() {
    console.log('Gmail Compose Timer Loaded');

    setInterval(function () {
      $( '.compose-timer' ).each(function() {
        var startDateTime = new Date($( this ).data( 'starttime' ));
        var timeDifference = new Date() - startDateTime;
        var seconds = Math.floor(timeDifference / 1000) % 60;  
        var minutes = Math.floor(timeDifference / 1000 / 60);
        var stopwatchString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        $( this ).html(stopwatchString);
      });
    },100);
  });
}
