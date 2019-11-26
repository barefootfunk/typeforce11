var Main = (function($) {

  var screen_width = 0,
      $document,
      documentElementStyle;

  // User sensor data
  var userX = 0.8; // I just like the way 0.8,0.8 looks. Default there before user interaction
  var userY = 0.8;

  // Debugging Options / Vars
  var enableAxis = false;
  var enableKeyPositioning = false;
  var displayCoords = false;
  var displayBoxes = false;


  function _init() {

    $document = $(document);
    documentElementStyle = document.documentElement.style;

    passUserCoordsToCSS();

    // Set screen size vars
    _resize();

    // Set debugging vars based on query string
    readDebuggingVars();

    // Determine appropriate sensor
    initUserPositioning();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        // Esc
      }
    });

  } // end init()

  // Called in quick succession as window is resized
  function _resize() {
    screenWidth = document.documentElement.clientWidth;
  }

  // Built a bunch of debugging features that can be accessed by query strings
  function readDebuggingVars() {

    // Get query string vars
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++){
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }

    // See if any of the debugging options are present in query string vars
    if ( typeof vars.coords !== 'undefined' ) { displayCoords = vars.coords; }
    if ( typeof vars.boxes !== 'undefined' ) { displayBoxes = vars.boxes; }

    // Init any debugging options


    // UI for testing acceleromater
    if(displayCoords) { $('body').append('<div class="user-coords"></div>'); }

    // UI for testing acceleromater
    if(displayBoxes) { $('body').addClass('debug-boxes'); }
  }

  // Update CSS withour coords
  function passUserCoordsToCSS() {
    documentElementStyle.setProperty('--user-x', userX);
    documentElementStyle.setProperty('--user-y', userY);
  }

  // Get the position of the users sensor (mouse of phone accelerometer) and map in a unit cartesian space [0,1] for both x,y
  function initUserPositioning() {

    // For throttling
    var lastMove = 0;
    var eventThrottle = 10;

    // UserX,Y will be given used to animate and will be read from accelerometers on devices that have those AND have touch screens
    // Otherwise we use mouse!
    // Note: Many laptops have accelerometers (hence the necessity of detecting touch)
    // It's not perfect but its the best I can figure...
    if (window.DeviceOrientationEvent && Modernizr.touchevents) {

      window.addEventListener("deviceorientation", function (event) {

        // Throttle (thanks Matt!)
        var now = Date.now();
        if (now > lastMove + eventThrottle) {
          lastMove = now;

          // Update debugging UI
          if(displayCoords) {
            $('.user-coords').empty().append('Gamma: '+event.gamma.toFixed(2)+'<br>userX: '+userX.toFixed(2)+'<br>Beta: '+event.beta.toFixed(2)+'<br>userY: '+userY.toFixed(2)+'<br>');
          }

          // Adjust position based on phone's angles
          var gammaUnit = (event.gamma+45)/90; // 45deg rotation in either direction gives range [0,1]
          var gammaUnitAdjusted = gammaUnit*2; // Maybe we want to vary more dramatically
          userX = Math.min(Math.max( gammaUnitAdjusted ,0),1); // Create strict [0,1] limit

          var betaUnit = (event.beta)/90; // 0-90deg rotation gives range [0,1]
          var betaUnitAdjusted = betaUnit*1; // Maybe we want to vary more dramatically
          userY = Math.min(Math.max( betaUnitAdjusted ,0),1); // Create strict [0,1] limit

          // Let CSS know
          passUserCoordsToCSS();
        }
      }, false);

    } else {

      var displayCoordsPreface='';
      // Update the debugging UI
      if (displayCoords) {
        displayCoordsPreface = 'Using mouse<br>'+(window.DeviceOrientationEvent ? 'Orientation Supported': 'No Orientation Event')+'<br>'+(Modernizr.touchevents ? 'Touch': 'No Touch');
      }

      // Adjust position based on mouse (if present)
      $(document).on('mousemove', function(e) {
        e.preventDefault();

        // Throttle (thanks Matt!)
        var now = Date.now();
        if (now > lastMove + eventThrottle) {
          lastMove = now;

          // Get vars
          var mouseX = e.clientX;
          var mouseY = e.clientY;
          var windowWidth = window.innerWidth;
          var windowHeight = window.innerHeight;

          // Map mouse x position to continuum [0,1]
          userX = (mouseX/windowWidth);
          userY = (mouseY/windowHeight);

          // Update debugging UI
          if(displayCoords) {
            $('.user-coords').empty().append(displayCoordsPreface+'<br>userX: '+userX.toFixed(2)+'<br>userY: '+userY.toFixed(2)+'<br>');
          }

          passUserCoordsToCSS();
        }
      });
    }
  }

  // Public functions
  return {
    init: _init,
    resize: _resize,
    scrollBody: function(section, duration, delay) {
      _scrollBody(section, duration, delay);
    }
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(Main.init);

// Zig-zag the mothership
jQuery(window).resize(Main.resize);
