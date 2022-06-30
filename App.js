/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {scanFaces} from 'vision-camera-face-detector';
import {runOnJS} from 'react-native-reanimated';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [faces, setFaces] = useState(); //Face[]
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
    console.log(faces?.[0]?.bounds || 'no faces');
  }, [faces]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    console.log([frame.width, frame.height], [width, height]);
    const scannedFaces = scanFaces(frame);
    runOnJS(setFaces)(scannedFaces);
  }, []);

  const getROIPosition = () => {
    const ROITop = Math.floor(faces?.[0]?.bounds?.y) || 0;
    const ROIHeight =
      Math.floor(faces?.[0]?.bounds?.height) || 10;

    const ROIRight = Math.floor(faces?.[0]?.bounds?.x) || 0;
    const ROIWidth = Math.floor(faces?.[0]?.bounds?.width * 755) || 10;

    const verticalValues = {
      top: Math.max(ROITop, 10),
      height: Math.max(ROIHeight, 20),
    };
    console.log('vertical: ', verticalValues);

    const horizontalValues = {
      width: Math.max(ROIWidth, 20),
      right: Math.max(ROIRight, 20),
    };

    const a = {
      ...horizontalValues,
      ...verticalValues,
    };
    console.log(a.top);
    return a;
  };

  return device != null && hasPermission ? (
    <>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={1}
      />
      <View
        style={{
          position: 'absolute',
          ...getROIPosition(),
          borderWidth: 2,
          borderColor: 'blue',
        }}
      />
    </>
  ) : (
    <Text>Loading...</Text>
  );
}
