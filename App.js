/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';

function App() {
  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
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
    <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
  );
}

export default App;
