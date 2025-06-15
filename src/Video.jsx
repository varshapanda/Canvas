import { Button, IconButton } from "blocksin-system";
import { FabricImage } from "fabric";
import { useState, useEffect, useRef } from "react";
import { PlayIcon, StopIcon, VideoCameraIcon } from "sebikostudio-icons";

//manage variety of tasks like uploading, playing , recording the canvas  content, and exporting the recording

function Video({ canvas, canvasRef }) {
  // this state holds the source url of the uploaded video
  // once the user uploads a video this state stores its url allowing us to display and play it  on thecanvas
  const [videoSrc, setVideoSrc] = useState(null);
  // Fabric video will hold our fabric js image  objects, this is not  any image but the video element wrapped as a fabric js object allowing us to manipulate it like any other canvas element
  const [fabricVideo, setFabricVideo] = useState(null);
  const [recordingChunks, setRecordingChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setLoadedPercentage(0);
      setVideoSrc(null);
      setUploadMessage("");

      const url = URL.createObjectURL(file);
      setVideoSrc(url);

      const videoElement = document.createElement("video");
      videoElement.src = url;
      videoElement.crossOrigin = "anonymous";

      videoElement.addEventListener("loadeddata", () => {
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        videoElement.width = videoWidth;
        videoElement.height = videoHeight;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const scale = Math.min(
          canvasWidth / videoWidth,
          canvasHeight / videoHeight
        );
        canvas.renderAll();

        const fabricImage = new FabricImage(videoElement, {
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
        });
        setFabricVideo(fabricImage);
        canvas.add(fabricImage);
        canvas.renderAll();

        setUploadMessage("Video Uploaded Successfully");
        setTimeout(() => {
          setUploadMessage("");
        }, 3000);
      });

      videoElement.addEventListener("progress", () => {
        if (videoElement.buffered.length > 0) {
          const bufferedEnd = videoElement.buffered.end(
            videoElement.buffered.length - 1
          );
          const duration = videoElement.duration;
          if (duration > 0) {
            setLoadedPercentage((bufferedEnd / duration) * 100);
          }
        }
      });

      videoElement.addEventListener("error", (error) => {
        console.error("Video load error", error);
      });
      videoRef.current = videoElement;
    }
  };

  const handlePlayPauseVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        videoRef.current.addEventListener("timeupdate", () => {
          fabricVideo.setElement(videoRef.current);
          canvas.renderAll();
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleStopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      canvas.renderAll();
    }
  };

  const handleVideoUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleStartRecording = () => {
    const stream = canvasRef.current.captureStream();
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
    setIsRecording(true);

    canvas.getObjects().forEach((obj) => {
      obj.hasControls = false;
      obj.selectable = false;
    });
    canvas.renderAll();
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    canvas.getObjects().forEach((obj) => {
      obj.hasControls = true;
    });
    canvas.renderAll();
    clearInterval(recordingIntervalRef.current);
  };

  const handleDataAvailable = (e) => {
    if (e.data.size > 0) {
      setRecordingChunks((prev) => [...prev, e.data]);
    }
  };

  const handleExportVideo = () => {
    const blob = new Blob(recordingChunks, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "canvas-video.webm";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    setRecordingChunks([]);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        accept="video/mp4"
        onChange={handleVideoUpload}
      />
      <IconButton
        onClick={handleVideoUploadButtonClick}
        variant="ghost"
        size="medium"
      >
        <VideoCameraIcon />
      </IconButton>

      {videoSrc && (
        <div className="bottom transform darkmode">
          <div className="Toolbar">
            <Button
              onClick={handlePlayPauseVideo}
              variant="ghost"
              size="medium"
            >
              {isPlaying ? "Pause video" : "Play video"}
            </Button>
            <Button onClick={handleStopVideo} variant="ghost" size="medium">
              Stop
            </Button>
          </div>
          
          <div className="Toolbar">
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${loadedPercentage}%` }}
              ></div>

              {uploadMessage && (
                <div className="upload-message">{uploadMessage}</div>
              )}
            </div>
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              variant="ghost"
              size="medium"
              showBadge={isRecording}
              badgeLabel={new Date(recordingTime * 1000)
                .toISOString()
                .substr(11, 8)}
            >
              {isRecording ? (
                <>
                  <StopIcon />
                  End
                </>
              ) : (
                <>
                  <PlayIcon /> Record
                </>
              )}
            </Button>
            <Button
              onClick={handleExportVideo}
              disabled={!recordingChunks.length}
            >
              Export Video
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Video;
