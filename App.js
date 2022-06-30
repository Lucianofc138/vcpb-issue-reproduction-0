/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-reanimated';
import React, {useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';

function App() {
  const devices = useCameraDevices();
  const device = devices.front;

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const isHotdog = Math.random() > 0.1;
    console.log(isHotdog ? 'Hotdog!' : 'Not Hotdog.');
  }, []);

  useEffect(() => {
    console.log('Hermes??: ', !!global.HermesInternal);
    (async () => {
      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
    })();
  }, []);

  if (device == null) {
    return <Text>Loading...</Text>;
  }
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      frameProcessorFps={0.2}
    />
  );
}

export default App;
