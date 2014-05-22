(function() {

  var fb_instance;
  var username = null;
  var fb_chat_room_id = null;
  var mediaRecorder;
  var ready;
  var loadedVid = false;
  var video_stream;
  var audio_stream;

  var fb_response_id = null;
  var fb_new_response = null;

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
    fb_response_id = address[address.length - 1];

    fb_instance = new Firebase("https://resplendent-fire-793.firebaseio.com/nuggets/" + fb_response_id + "/response/");

    fb_instance.on('value', function(snapshot) {
      if (loadedVid === false) {
        if(snapshot.val() === null) {
          alert('Nugget not found!');
        } else {
          display_vid(snapshot.val());
          loadedVid = true;
        }
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
