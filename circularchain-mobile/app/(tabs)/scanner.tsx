import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const registerProduct = async (productId: string) => {
    try {
      console.log('Sending request to backend:', { productID: productId });
      
      const response = await axios.post('http://167.71.237.249/api/returns', {
        productID: productId
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      console.log('Backend response:', response.data);
      Alert.alert('Success', `Product ${productId} registered successfully!`);
      router.replace('/');
    } catch (error) {
      console.error("Error connecting to backend:", error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        Alert.alert('Error', `Backend error: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        Alert.alert('Error', 'Could not connect to backend. Make sure the server is running.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
      
      setScanned(false);
    }
  };
  
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    Alert.alert(
      'QR Code Scanned',
      `Scanned: ${data}`,
      [
        { text: 'Cancel', onPress: () => setScanned(false) },
        { text: 'Register Product', onPress: () => registerProduct(data) }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <Button title="Grant Permission" onPress={() => {
          Camera.requestCameraPermissionsAsync().then(({ status }) => {
            setHasPermission(status === 'granted');
          });
        }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
      />
      {scanned && (
        <View style={styles.buttonContainer}>
          <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Point camera at QR code or barcode</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  overlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});
