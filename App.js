/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {
  Button,
  Dimensions,
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

  const [frameSize, setFrameSize] = useState({height, width});
  const window = Dimensions.get('window');
  const width = window?.width || 0;
  const height = window?.height || 0;

  const devices = useCameraDevices();
  const device = devices.front;

  useEffect(() => {
    console.log(faces?.[0]?.bounds || 'no faces');
  }, [faces]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');

      await Camera.requestMicrophonePermission();
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Write Permission',
          message: 'RNCamera0 need write permission',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    })();
  }, []);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    console.log('------------------------------');
    console.log('frame: ', frame.toString());
    const frameHeight = Math.max(frame?.width || 0, frame?.height || 0);
    const frameWidth = Math.min(frame?.width || 0, frame?.height || 0);
    const size = {height: frameHeight, width: frameWidth};
    console.log('frame:', size);
    console.log('screen', {width, height});

    // console.log('size: ', size);
    runOnJS(setFrameSize)(size);
    const scannedFaces = scanFaces(frame);
    runOnJS(setFaces)(scannedFaces);
  }, []);

  const getROIPosition = () => {
    console.log('frame size: ', frameSize);
    console.log('size: ', {height, width});
    const verticalFactor = height / frameSize.height; //Device size vs Frame size for Huawei Mate 20 Pro
    const ROIHeight =
      Math.floor(faces?.[0]?.bounds?.height * verticalFactor) || 10;
    const ROITop =
      Math.floor(
        faces?.[0]?.bounds?.boundingExactCenterY * verticalFactor -
          ROIHeight / 2,
      ) || 0;
    console.log({verticalFactor, ROITop, ROIHeight});

    const horizontalFactor = width / frameSize.width;
    const ROIWidth =
      Math.floor(faces?.[0]?.bounds?.width * horizontalFactor) || 10;
    const ROIRight =
      Math.floor(
        faces?.[0]?.bounds?.boundingExactCenterX * horizontalFactor -
          ROIWidth / 2,
      ) || 0;

    const verticalValues = {
      top: ROITop,
      height: ROIHeight,
    };
    console.log('vertical: ', verticalValues);

    const horizontalValues = {
      width: ROIWidth,
      right: ROIRight,
    };
    // console.log('horizontal: ', horizontalValues);

    const a = {
      ...horizontalValues,
      ...verticalValues,
    };
    // console.log(a.top);
    return a;
  };

  return device != null && hasPermission ? (
    <>
      <Camera
        style={StyleSheet.absoluteFill}
        // style={{
        //   height: 128 * 5,
        //   width: 72 * 5,
        // }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={1}
        videoStabilizationMode={true}
      />
      <View
        style={{
          position: 'absolute',
          ...getROIPosition(),
          borderWidth: 2,
          borderColor: 'blue',
        }}
      />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <Button
          title={'Boton'}
          onPress={async () => {
            console.log('Front camera');
            const photo = await Camera.current.takeSnapshot({
              quality: 85,
              skipMetadata: true,
            });
            console.log(photo);
            // console.log(device.formats);
          }}
        />
      </View>
    </>
  ) : (
    <Text>Loading...</Text>
  );
}
