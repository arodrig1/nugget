(function() {

  var BAR_MIN = 0;
  var BAR_MAX = 100;
  var BAR_RECORD_STEP = 1;
  // 2 mins
  var VID_MAX = 120000;
  //var REC_KEY = 220;

  var cur_video_blob = null;
  var fb_instance;
  var username = null;
  var fb_chat_room_id = null;
  //var fb_new_chat_room;
  //var fb_instance_users;
  //var fb_instance_stream;
  //var my_color;
  var mediaRecorder;

  $(document).ready(function(){
    connect_to_chat_firebase();
    connect_webcam();
    $("#recordbar").progressbar({ 
      value: BAR_MIN,
      max: BAR_MAX,
      complete: function(event, ui) {
        mediaRecorder.stop();
        $(this).progressbar("value", BAR_MIN);
      }
    });
    $("#stop").prop("disabled", true);
    $("#send").prop("disabled", true);
  });

  function connect_to_chat_firebase(){
    /* Include your Firebase link here!*/
    fb_instance = new Firebase("https://resplendent-fire-793.firebaseio.com");

    // generate new nugget id
    fb_nugget_id = Math.random().toString(36).substring(7);

    // set up variables to access firebase data structure
    fb_new_nugget = fb_instance.child('nuggets').child(fb_nugget_id);
    fb_instance_stream = fb_new_nugget.child('stream');

    // listen to events
    fb_instance_stream.on("child_added", function(snapshot) {
      //display_msg(snapshot.val());
      console.log("Video added to firebase stream!");
    });

    // block until username is answered
    username = window.prompt("Welcome! Please enter your name, as you would like your recipients to see it:");
    if(!username){
      username = "anonymous" + Math.floor(Math.random()*1111);
    }

    $("#waiting").remove();

    $("#start").click(function(event) {
      $(this).prop("disabled", true);
      $("#stop").prop("disabled", false);
      mediaRecorder.start(VID_MAX);
    });

    $("#stop").click(function(event) {
      $(this).prop("disabled", true);
      $("#recordbar").progressbar("value", BAR_MIN);
      mediaRecorder.stop();
    });

    $("#send").click(function(event) {
      alert("Send this link to MOMMY!: " + window.location.origin + "/nuggets/" + fb_nugget_id);
    });
  }

  // creates a message node and appends it to the conversation
  function display_msg(data){
    $("#conversation").append("<div class='msg' style='color:"+data.c+"'>"+data.m+"</div>");
    if(data.v){
      // for video element
      var video = document.createElement("video");
      video.autoplay = true;
      video.controls = false; // optional
      video.loop = true;
      video.width = 120;

      var source = document.createElement("source");
      source.src =  URL.createObjectURL(base64_to_blob(data.v));
      source.type =  "video/webm";

      video.appendChild(source);

      // for gif instead, use this code below and change mediaRecorder.mimeType in onMediaSuccess below
      // var video = document.createElement("img");
      // video.src = URL.createObjectURL(base64_to_blob(data.v));

      document.getElementById("conversation").appendChild(video);
    }
  }

  function scroll_to_bottom(wait_time){
    // scroll to bottom of div
    setTimeout(function(){
      $("html, body").animate({ scrollTop: $(document).height() }, 200);
    }, wait_time);
  }

  function connect_webcam(){
    // we're only recording video, not audio
    var mediaConstraints = {
      video: true,
      audio: true
    };

    // callback for when we get video stream from user.
    var onMediaSuccess = function(stream) {
      // create video element, attach webcam stream to video element
      var video_width= 640;
      var video_height= 480;
      var webcam_stream = document.getElementById('webcam_stream');
      var video = document.createElement('video');
      webcam_stream.innerHTML = "";
      // adds these properties to the video
      video = mergeProps(video, {
          controls: false,
          width: video_width,
          height: video_height,
          src: URL.createObjectURL(stream)
      });
      video.play();
      webcam_stream.appendChild(video);

      var video_container = document.getElementById('video_container');
      mediaRecorder = new MediaStreamRecorder(stream);
      var index = 1;

      mediaRecorder.mimeType = 'video/webm';
      // mediaRecorder.mimeType = 'image/gif';
      // make recorded media smaller to save some traffic (80 * 60 pixels, 3*24 frames)
      mediaRecorder.video_width = video_width/2;
      mediaRecorder.video_height = video_height/2;

      mediaRecorder.ondataavailable = function (blob) {
          video_container.innerHTML = "";

          // convert data into base 64 blocks
          blob_to_base64(blob, function(b64_data){
            cur_video_blob = b64_data;
            //fb_instance_stream.push({ f: username, m: $("#submission input").val(), v: cur_video_blob });
            fb_instance_stream.push({ f: username, v: cur_video_blob });
          });

          $("#send").prop("disabled", false);
      };

      console.log("Connected to media stream!");
    }

    // callback if there is an error when we try and get the video stream
    var onMediaError = function(e) {
      console.error('media error', e);
    }

    // get video stream from user. see https://github.com/streamproc/MediaStreamRecorder
    navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
  }

  // some handy methods for converting blob to base 64 and vice versa
  // for performance bench mark, please refer to http://jsperf.com/blob-base64-conversion/5
  // note using String.fromCharCode.apply can cause callstack error
  var blob_to_base64 = function(blob, callback) {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      var base64 = dataUrl.split(',')[1];
      callback(base64);
    };
    reader.readAsDataURL(blob);
  };

  var base64_to_blob = function(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    var blob = new Blob([view]);
    return blob;
  };

})();
