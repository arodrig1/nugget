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
  var mediaRecorder;
  var ready;
  var loadedVid = false;
  var video_stream;
  var audio_stream;

  var NUM_VID_BLOCKS = 10;
  var NUM_AUD_BLOCKS = 15;

  var fb_response_id = null;
  var fb_new_response = null;

  var record_down;

  var tour = new Tour({
    steps: [
    {
      orphan: true,
      backdrop: true,
      title: "Get ready to watch a nugget!",
      content: "To get started, let us get ready to record your response by clicking \"allow\" on the top right corner for both video AND audio."
    },
    {
      element: "#play",
      title: "Start watching!",
      content: "Click this button to watch the nugget you just received."
    },
    {
      element:"#pause",
      title: "Have to go?",
      content: "Hit this if you need to leave midway through the nugget."
    },
    {
      element: "#clear",
      title: "A second chance",
      content: "If you think you weren't interesting enough the first time around, go ahead and start over by clearing your previous attempt."
    },
    {
      element: "#stop",
      title: "Start over",
      content: "Hit this to start stop the nugget where it is and start it over again."
    },
    {
      element: "#respond",
      title: "Send your child an answer",
      content: "Hit this button to start recording your response!  You will see a countdown above the video and it will record for a maximum of 30 seconds."
    }]
  });

  $(document).ready(function(){
    $("#play").prop("disabled", true);
    $("#pause").prop("disabled", true);
    $("#stop").prop("disabled", true);
    $("#respond").prop("disabled", true);
    $("#stop_response").hide();

    authorize_media();
    prompt_instructions();
    connect_to_chat_firebase();

    $("#play").click(function(event) {
      document.getElementById("video_elem").play();
      document.getElementById("audio_elem").play();
      $("#pause").prop("disabled", false);
      $("#stop").prop("disabled", false);
    });

    $("#pause").click(function(event) {
      document.getElementById("video_elem").pause();
      document.getElementById("audio_elem").pause();
      $("#play").prop("disabled", false);
    });

    $("#stop").click(function(event) {
      document.getElementById("video_elem").pause();
      document.getElementById("audio_elem").pause();
      document.getElementById("video_elem").currentTime = 0;
      document.getElementById("audio_elem").currentTime = 0;
      $("#play").prop("disabled", false);
      $("#pause").prop("disabled", true);
    });

    $("#respond").click(function(event) {
      video_response();
    });

    $('#respond_form').submit(function(event) {
      $.post($(this).attr('action'), $(this).serialize(), function(res){
          // Do something with the response `res`
          console.log(res);
          alert("Response sent!");
      });
      return false;
    });

    $("#stop_response").click(function(event) {
      stop_recording_response();
    });

  });

  function prompt_instructions() {
    tour.init();
    tour.start();
  }

  function connect_to_chat_firebase(){
    var address = document.URL.split("/");
    fb_nugget_id = address[address.length - 1];

    $("#response_id_input").val(fb_nugget_id);

    fb_response_id = Math.random().toString(36).substring(7);

    fb_instance = new Firebase("https://resplendent-fire-793.firebaseio.com/nuggets/" + fb_nugget_id + "/");

    fb_new_response = fb_instance.child('response');

    fb_instance.on('value', function(snapshot) {
      if (loadedVid === false) {
        if(snapshot.val() === null) {
          alert('Nugget not found!');
        } else {
          display_vid(snapshot.val());
          $("#play").prop("disabled", false);
          $("#respond").prop("disabled", false);
          loadedVid = true;
        }
      }
    });
  }

  function display_vid(data) {
    var vid_base64 = "";
    for (var i = 0; i < NUM_VID_BLOCKS; i++) {
      vid_base64 += data["v" + i];
    }
     
    var aud_base64 = "";
    for (var i = 0; i < NUM_AUD_BLOCKS; i++) {
      aud_base64 += data["a" + i];
    }    

    var video = document.createElement("video");
    video.autoplay = false;
    video.controls = false; // optional
    video.loop = false;
    video.width = 640;
    video.height = 480;
    video.id = "video_elem";

    var source = document.createElement("source");
    var vid_blob = base64_to_blob(vid_base64);
    vid_blob.type = "video/webm"
    source.src =  URL.createObjectURL(vid_blob);
    source.type =  "video/webm";

    video.appendChild(source);

    var audio = document.createElement("audio");
    audio.controls = false;
    audio.id = "audio_elem";
    var audio_blob = base64_to_blob(aud_base64);
    audio_blob.type = "audio/wav";
    audio.src = URL.createObjectURL(audio_blob);
    audio.type = "audio/wav";

    // for gif instead, use this code below and change mediaRecorder.mimeType in onMediaSuccess below
    // var video = document.createElement("img");
    // video.src = URL.createObjectURL(base64_to_blob(data.v));

    document.getElementById("webcam_stream").appendChild(video);
    document.getElementById("audio_container").appendChild(audio);
  }

  function authorize_media() {
    ready = 0; // use a counter to make sure audio and video are all ready

    navigator.getUserMedia({video: true}, function(mediaStream) {
      video_stream = mediaStream;
      window.recordRTC_Video = RecordRTC(mediaStream, {type:"video"});
      ready += 1;
    }, function(failure){
      console.log(failure);
    });

    navigator.getUserMedia({audio: true}, function(mediaStream) {
      audio_stream = mediaStream;
      window.recordRTC_Audio = RecordRTC(mediaStream);
      ready += 1;
    },function(failure){
      console.log(failure);
    });
  }

  function video_response() {
      // hide nugget video and replace with webcam feed
      document.getElementById("video_elem").pause();
      document.getElementById("audio_elem").pause();
      $("#video_elem").hide();

      // create new video element adn attach webcam stream
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
          src: URL.createObjectURL(video_stream)
      });
      video.play();
      webcam_stream.appendChild(video);

      var time = 3;
      $("#timer").html(time);
      var timer_down = setInterval(function() {
        $("#timer").html(time--);
      }, 1000);

      setTimeout(function() {
        clearInterval(timer_down);
        time = 30;
        $("#stop_response").show();
        $("#timer").html("Recording response... You have 30 seconds!");
        record_down = setInterval(function() {
          $("#timer").html("Recording response... You have " + time-- + " seconds!");
        }, 1000);
      }, 3100);

      recordRTC_Video.startRecording();
      recordRTC_Audio.startRecording();

      setTimeout(function() {
        stop_recording_response();
      }, 30000);
  }

  function stop_recording_response() {
    recordRTC_Video.stopRecording(function(videoURL) {
      datauri_to_blob(videoURL, function(blob) {
        blob_to_base64(blob, function(base64){
          fb_new_response.child("v").set(base64);
          console.log("Response v entry set!");
        });
      });        
    });

    recordRTC_Audio.stopRecording(function(audioURL) {
      datauri_to_blob(audioURL, function(blob) {
        blob_to_base64(blob, function(base64){
          fb_new_response.child("f").set(username);
          fb_new_response.child("a").set(base64);
          console.log("Response f and a entries set!");
        });
      });
    });

    clearInterval(record_down);

    $("#timer").html("Done recording!");
    $("#respond_form").submit();
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
