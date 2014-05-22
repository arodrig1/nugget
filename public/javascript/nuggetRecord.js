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
  var fb_nugget_id = null;
  var fb_new_nugget = null;
  var ready;

  var tour;

  $(document).ready(function(){
    connect_to_firebase();
    prompt_username();
    set_button_handlers();
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
    $("#clear").prop("disabled", true);
    $("#clear").hide();
    $("#send").prop("disabled", true);
  });

  function connect_to_firebase(){
    /* Include your Firebase link here!*/
    fb_instance = new Firebase("https://resplendent-fire-793.firebaseio.com");

    // generate new nugget id
    fb_nugget_id = Math.random().toString(36).substring(7);

    // set up variables to access firebase data structure
    fb_new_nugget = fb_instance.child('nuggets').child(fb_nugget_id);

    console.log("Nugget id: " + fb_nugget_id);
    $("#nugget_id_input").val(fb_nugget_id);
  }

  function prompt_username() {
    // block until username is answered
    username = window.prompt("Welcome! Please enter your name, as you would like your recipients to see it:");
    if(!username){
      username = "anonymous" + Math.floor(Math.random()*1111);
    }

    $("#waiting").remove();
  }

    
  function set_button_handlers() {
    $("#start").click(function(event) {
      if (ready == 2) {
        $(this).prop("disabled", true);
        $("#stop").prop("disabled", false);
        recordRTC_Video.startRecording();
        recordRTC_Audio.startRecording();
        //setTimeout(function() { recordRTC_Video.startRecording(); }, 1000);
      } else {
        alert("Allow audio and video first!");
      }      
    });

    $("#stop").click(function(event) {
      $(this).prop("disabled", true);
      $("#recordbar").progressbar("value", BAR_MIN);

      recordRTC_Video.stopRecording(function(videoURL) {
        datauri_to_blob(videoURL, function(blob) {
          blob_to_base64(blob, function(base64){
            fb_new_nugget.child("v").set(base64);
            console.log("Nugget v entry set!");
          });
        });        
      });

      recordRTC_Audio.stopRecording(function(audioURL) {
        datauri_to_blob(audioURL, function(blob) {
          blob_to_base64(blob, function(base64){
            fb_new_nugget.child("f").set(username);
            fb_new_nugget.child("a").set(base64);
            console.log("Nugget f and a entries set!");
          });
        });
      });

      $("#clear").prop("disabled", false);
      $("#clear").show();
      $("#send").prop("disabled", false);
    });

    $("#clear").click(function(event) {
      $("#stop").click();
      $("#start").prop("disabled", false);
      $("#clear").prop("disabled", true);
      $("#clear").hide();
      $("#send").prop("disabled", true);
    })
  }

  function connect_webcam() {
    ready = 0; // use a counter to make sure audio and video are all ready
    console.log("in webcam");

    // record video
    navigator.getUserMedia({video: true}, function(mediaStream) {
      console.log("in video permissions");
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
          src: URL.createObjectURL(mediaStream)
      });
      video.play();
      webcam_stream.appendChild(video);
      var video_container = document.getElementById('video_container');

      window.recordRTC_Video = RecordRTC(mediaStream, {type:"video"});
      console.log("+1 to ready");
      ready += 1;
    }, function(failure){
      console.log("video didn't work");
      console.log(failure);
    });

    navigator.getUserMedia({audio: true}, function(mediaStream) {
      window.recordRTC_Audio = RecordRTC(mediaStream);
      console.log("before audio");
      ready += 1;
    },function(failure){
      console.log(failure);
    });
  }

  function datauri_to_blob(dataURI,callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', dataURI, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
      if (this.status == 200) {
        callback(this.response);
      }
    };
    xhr.send();
  }

  var blob_to_base64 = function(blob, callback) {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      var base64 = dataUrl.split(',')[1];
      callback(base64);
    };
    reader.readAsDataURL(blob);
  };

})();
