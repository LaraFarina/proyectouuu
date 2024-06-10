import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';

const modelojson = require("./modelo/model.json")
const metajson = require("./modelo/metadata.json")
const TeachableMachine = () => {
  const URL = "./modelo/";
  const [model, setModel] = useState(null);
  const [webcam, setWebcam] = useState(null);
  const [labelContainer, setLabelContainer] = useState(null);
  const [maxPredictions, setMaxPredictions] = useState(0);
  const webcamRef = useRef(null);
  const labelContainerRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";
      //const loadedModel = await tmImage.load(modelURL, metadataURL);
      const loadedModel = await tmImage.load(modelojson, metajson);
      setModel(loadedModel);
      setMaxPredictions(loadedModel.getTotalClasses());
    };

    loadModel();

    return () => {
      // Clean up code here if needed
    };
  }, []);

  useEffect(() => {
    const setupWebcam = async () => {
      const flip = true; // whether to flip the webcam
      const newWebcam = new tmImage.Webcam(200, 200, flip);
      await newWebcam.setup();
      await newWebcam.play();
      setWebcam(newWebcam);
    };

    setupWebcam();

    return () => {
      if (webcam) webcam.stop();
    };
  }, []);

  useEffect(() => {
    if (webcam && labelContainer) {
      const loop = async () => {
        webcam.update();
        await predict();
        requestAnimationFrame(loop);
      };
      loop();
    }
  }, [webcam, labelContainer]);

  const init = () => {
    setLabelContainer(labelContainerRef.current);
  };

  const predict = async () => {
    if (model && webcam) {
      const prediction = await model.predict(webcam.canvas);
      for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `${prediction[i].className}: ${prediction[i].probability.toFixed(2)}`;
        labelContainer.childNodes[i].innerHTML = classPrediction;
      }
    }
  };

  return (
    <div>
      <div>Teachable Machine Image Model</div>
      <button type="button" onClick={init}>Start</button>
      <div ref={labelContainerRef}></div>
      <div ref={webcamRef}></div>
    </div>
  );
};

export default TeachableMachine;
