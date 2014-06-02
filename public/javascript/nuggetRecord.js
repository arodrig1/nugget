(function() {

  var BAR_MIN = 0;
  var BAR_MAX = 480;
  var BAR_RECORD_STEP = 1;
  // 2 mins
  var VID_MAX = 120000;
  //var REC_KEY = 220;
  var progress_interval;

  var MAX_FIREBASE_BYTES = 10485760;
  var FIREBASE_BLOCK_SIZE = MAX_FIREBASE_BYTES/5;
  var NUM_VID_BLOCKS = 10;
  var NUM_AUD_BLOCKS = 15;

  var cur_video_blob = null;
  var fb_instance;
  var username = null;
  var fb_nugget_id = null;
  var fb_new_nugget = null;
  var ready;

  var tour = new Tour({
    // storage: false,
    steps: [
    {
      orphan: true,
      backdrop: true,
      title: "Help us help you!",
      content: "To get started, let us record you by clicking allow on the top right corner for both video AND audio."
    },
    {
      element: "#record",
      title: "This is how we do it",
      content: "Click this button to start recording a (max 2 minute) video to your parents!"
    },
    {
      element:"#stop",
      title: "Done?",
      content: "Once you've said what you came to say, hit this button to stop recording."
    },
    {
      element: "#clear",
      title: "A second chance",
      content: "If you think you weren't interesting enough the first time around, go ahead and start over by clearing your previous attempt."
    },
    {
      element: "#send",
      title: "Share it!",
      content: "Your name will appear in the email to the recipient and the recipient's response nugget will be sent to your email address."
    }]
  });

  $(document).ready(function(){
    connect_to_firebase();
    set_button_handlers();
    connect_webcam();

    $("#recordbar").progressbar({ 
      value: BAR_MIN,
      max: BAR_MAX,
      disabled: true,
      complete: function(event, ui) {
        $("#stop").click();
      }
    });

    $("#record").prop("disabled", true);
    $("#stop").prop("disabled", true);
    $("#play").prop("disabled", true);
    $("#play").hide();
    $("#pause").prop("disabled", true);
    $("#pause").hide();
    $("#rewind").prop("disabled", true);
    $("#rewind").hide();
    $("#clear").prop("disabled", true);
    $("#clear").hide();
    $("#send").prop("disabled", true);

    tour.init();
    tour.start();

    $("#record").prop("disabled", false);
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
  }

  function attach_video(video_blob) {
    $("#video_container").empty();

    var video = document.createElement("video");
    video.autoplay = false;
    video.controls = false; // optional
    video.loop = false;
    video.width = 640;
    video.height = 480;
    video.id = "video_elem";

    var source = document.createElement("source");
    video_blob.type = "video/webm"
    source.src =  URL.createObjectURL(video_blob);
    source.type =  "video/webm";

    video.appendChild(source);

    document.getElementById("video_container").appendChild(video);
  }

  function attach_audio(audio_blob) {
    detach_audio();

    var audio = document.createElement("audio");
    audio.controls = false;
    audio.id = "audio_elem";
    audio_blob.type = "audio/wav";
    audio.src = URL.createObjectURL(audio_blob);
    audio.type = "audio/wav";

    document.getElementById("audio_container").appendChild(audio);
  }

  function detach_audio() {
    $("#audio_container").empty(); 
  }
    
  function set_button_handlers() {
    $("#record").click(function(event) {
      if (ready == 2) {
        recordRTC_Video.startRecording();
        recordRTC_Audio.startRecording();
        $(this).prop("disabled", true);
        //$("#recordbar").progressbar("enable");
        $("#stop").prop("disabled", false);
        progress_interval = setInterval(function() {
          $("#recordbar").progressbar("value", $("#recordbar").progressbar("value") + 1);
        }, 250);
      } else {
        alert("Allow audio and video first!");
      }      
    });

    $("#stop").click(function(event) {
      clearInterval(progress_interval);
      $(this).prop("disabled", true);

      recordRTC_Video.stopRecording(function(videoURL) {
        datauri_to_blob(videoURL, function(blob) {
          attach_video(blob);
          blob_to_base64(blob, function(base64){
            for (var i = 0; i < NUM_VID_BLOCKS; i++) {
              var part = base64.substring(FIREBASE_BLOCK_SIZE * i, FIREBASE_BLOCK_SIZE * (i + 1));
              fb_new_nugget.child("v" + i).set(part);
            }
            console.log("Nugget v entries set!");
          });
        });        
      });

      recordRTC_Audio.stopRecording(function(audioURL) {
        datauri_to_blob(audioURL, function(blob) {
          attach_audio(blob);
          blob_to_base64(blob, function(base64){
            for (var i = 0; i < NUM_AUD_BLOCKS; i++) {
              var part = base64.substring(FIREBASE_BLOCK_SIZE * i, FIREBASE_BLOCK_SIZE * (i + 1));
              fb_new_nugget.child("a" + i).set(part);
            }
            console.log("Nugget a entries set!");
          });
        });
      });

      $("#record").prop("disabled", true);
      $("#record").hide();
      $("#stop").prop("disabled", true);
      $("#stop").hide();

      $("#play").prop("disabled", false);
      $("#play").show();
      $("#pause").show();
      $("#rewind").show();

      $("#clear").prop("disabled", false);
      $("#clear").show();
      $("#send").prop("disabled", false);
    });

    $("#clear").click(function(event) {
      connect_webcam();
      detach_audio();
      $("#send").prop("disabled", true);

      $("#play").prop("disabled", true);
      $("#play").hide();
      $("#pause").prop("disabled", true);
      $("#pause").hide();
      $("#rewind").prop("disabled", true);
      $("#rewind").hide();

      $("#clear").prop("disabled", true);
      $("#record").prop("disabled", false);
      $("#record").show();
      $("#stop").prop("disabled", true);
      $("#stop").show();
      $("#clear").hide();     

      $("#recordbar").progressbar("value", BAR_MIN);
    });

    $("#play").click(function(event) {
      $(this).prop("disabled", true);
      document.getElementById("video_elem").play();
      document.getElementById("audio_elem").play();
      $("#pause").prop("disabled", false);
      $("#rewind").prop("disabled", false);
    });

    $("#pause").click(function(event) {
      $(this).prop("disabled", true);
      document.getElementById("video_elem").pause();
      document.getElementById("audio_elem").pause();
      $("#play").prop("disabled", false);
      $("#rewind").prop("disabled", false);
    });

    $("#rewind").click(function(event) {
      $(this).prop("disabled", true);
      document.getElementById("video_elem").pause();
      document.getElementById("audio_elem").pause();
      document.getElementById("video_elem").currentTime = 0;
      document.getElementById("audio_elem").currentTime = 0;
      $("#play").prop("disabled", false);
    });
  }

  function connect_webcam() {
    ready = 0; // use a counter to make sure audio and video are all ready

    // record video
    navigator.getUserMedia({video: true}, function(mediaStream) {
      // create video element, attach webcam stream to video element
      // create video element, attach webcam stream to video element
      var video_width= 640;
      var video_height= 480;
      var webcam_stream = document.getElementById('video_container');
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

      window.recordRTC_Video = RecordRTC(mediaStream, {type:"video"});
      ready += 1;
    }, function(failure){
      console.log(failure);
    });

    navigator.getUserMedia({audio: true}, function(mediaStream) {
      window.recordRTC_Audio = RecordRTC(mediaStream);
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
