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

  $(document).ready(function(){
    connect_to_chat_firebase();

    $("#play").click(function(event) {
      document.getElementById("video_elem").play();
      document.getElementById("audio_elem").play();
    });

    $("#pause").click(function(event) {
      document.getElementById("video_elem").pause();
      document.getElementById("audio_elem").pause();
    });

    $("#stop").click(function(event) {
      document.getElementById("video_elem").pause();
      document.getElementById("audio_elem").pause();
      document.getElementById("video_elem").currentTime = 0;
      document.getElementById("audio_elem").currentTime = 0;
    });
  });

  function connect_to_chat_firebase(){
    var address = document.URL.split("/");
    fb_nugget_id = address[address.length - 1];

    fb_instance = new Firebase("https://resplendent-fire-793.firebaseio.com/nuggets/" + fb_nugget_id + "/");

    fb_instance.on('value', function(snapshot) {
      if(snapshot.val() === null) {
        alert('Nugget not found!');
      } else {
        display_vid(snapshot.val());
      }
    });
  }

  function display_vid(data) {    
    var video = document.createElement("video");
    video.autoplay = false;
    video.controls = false; // optional
    video.loop = false;
    video.width = 640;
    video.height = 480;
    video.id = "video_elem";

    var source = document.createElement("source");
    var vid_blob = base64_to_blob(data.v);
    vid_blob.type = "video/webm"
    source.src =  URL.createObjectURL(vid_blob);
    source.type =  "video/webm";

    video.appendChild(source);

    var audio = document.createElement("audio");
    audio.controls = false;
    audio.id = "audio_elem";
    var audio_blob = base64_to_blob(data.a);
    audio_blob.type = "audio/wav";
    audio.src = URL.createObjectURL(audio_blob);
    audio.type = "audio/wav";

    // for gif instead, use this code below and change mediaRecorder.mimeType in onMediaSuccess below
    // var video = document.createElement("img");
    // video.src = URL.createObjectURL(base64_to_blob(data.v));

    document.getElementById("webcam_stream").appendChild(video);
    document.getElementById("audio_container").appendChild(audio);
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
      audio: false
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