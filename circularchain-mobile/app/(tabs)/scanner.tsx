import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Modal, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState<'register' | 'view'>('register');
  const [showHistory, setShowHistory] = useState(false);
  const [productHistory, setProductHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const scanTimeoutRef = useRef<number | null>(null);
  const { user } = useAuth();
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  // Pulse animation for scan area
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const registerProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      console.log('Sending request to backend:', { productID: productId, scannedBy: user?.email });
      
      const response = await axios.post('http://192.168.1.6:3001/api/returns', {
        productID: productId,
        scannedBy: user?.email?.toLowerCase()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      console.log('Backend response:', response.data);
      
      // Show success animation
      Alert.alert(
        'Success! ✅',
        `Product ${productId} registered successfully!`,
        [
          {
            text: 'Go to Home',
            onPress: () => router.replace('/'),
            style: 'default'
          },
          {
            text: 'Scan Another',
            onPress: () => setScanned(false),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error("Error connecting to backend:", error);
      Alert.alert(
        'Registration Failed ❌',
        'Could not register product. Please check your connection and try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
            style: 'default'
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const viewProductHistory = async (productId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching product history for:', productId);
      
      const response = await axios.get('http://192.168.1.6:3001/api/returns', { timeout: 10000 })
      .catch(error => {
        console.log('Axios error:', error.message, error.config?.url);
      });

      const product = response.data.find((p: any) => p.productID === productId);
      
      if (product) {
        setProductHistory(product);
        setShowHistory(true);
      } else {
        Alert.alert(
          'Product Not Found 🔍',
          `No product found with ID: ${productId}`,
          [
            {
              text: 'Scan Again',
              onPress: () => setScanned(false),
              style: 'default'
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error fetching product history:", error);
      Alert.alert(
        'Fetch Failed ❌',
        'Could not fetch product history. Please check your connection and try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
            style: 'default'
          }
        ]
      );
    } finally {
      setIsLoading(false);
      setScanned(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    console.log('QR Code scanned:', data);
    setScanned(true);
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    scanTimeoutRef.current = setTimeout(() => {
      if (scanMode === 'register') {
        Alert.alert(
          'QR Code Detected 📱',
          `Product ID: ${data}`,
          [
            { 
              text: 'Cancel', 
              onPress: () => {
                setScanned(false);
                scanTimeoutRef.current = null;
              },
              style: 'cancel'
            },
            { 
              text: 'Register Product', 
              onPress: () => {
                registerProduct(data);
                scanTimeoutRef.current = null;
              },
              style: 'default'
            }
          ]
        );
      } else {
        viewProductHistory(data);
        scanTimeoutRef.current = null;
      }
    }, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Like New': return '#10B981';
      case 'Needs Refurbishment': return '#F59E0B';
      case 'Recycle': return '#EF4444';
      case 'Returned - Pending Inspection': return '#3B82F6';
      case 'Transferred to Partner': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Like New': return 'checkmark-circle';
      case 'Needs Refurbishment': return 'build';
      case 'Recycle': return 'trash';
      case 'Returned - Pending Inspection': return 'time';
      case 'Transferred to Partner': return 'people';
      default: return 'help-circle';
    }
  };

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  // Loading Screen
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  // Permission Denied Screen
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.permissionContainer}
        >
          <View style={styles.permissionContent}>
            <Ionicons name="camera-off" size={80} color="#EF4444" />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              CircularChain needs camera access to scan QR codes and register products.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={() => {
                Camera.requestCameraPermissionsAsync().then(({ status }) => {
                  setHasPermission(status === 'granted');
                });
              }}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.gradientButton}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnimation }]}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="qr-code-outline" size={24} color="white" />
              <Text style={styles.headerTitle}>CircularChain Scanner</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Mode Selection */}
      <Animated.View style={[styles.modeContainer, { opacity: fadeAnimation }]}>
        <BlurView intensity={80} style={styles.modeBlur}>
          <View style={styles.modeContent}>
            <TouchableOpacity
              style={[styles.modeButton, scanMode === 'register' && styles.activeMode]}
              onPress={() => setScanMode('register')}
            >
              <Ionicons 
                name="add-circle" 
                size={20} 
                color={scanMode === 'register' ? 'white' : '#6B7280'} 
              />
              <Text style={[styles.modeText, scanMode === 'register' && styles.activeModeText]}>
                Register Product
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modeButton, scanMode === 'view' && styles.activeMode]}
              onPress={() => setScanMode('view')}
            >
              <Ionicons 
                name="eye" 
                size={20} 
                color={scanMode === 'view' ? 'white' : '#6B7280'} 
              />
              <Text style={[styles.modeText, scanMode === 'view' && styles.activeModeText]}>
                View History
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'upc_e'],
          }}
        />
        
        {/* Scan Area Overlay */}
        <View style={styles.scanOverlay}>
          <Animated.View 
            style={[
              styles.scanArea,
              {
                transform: [{ scale: pulseAnimation }],
              }
            ]}
          >
            <View style={styles.scanCorner} />
            <View style={[styles.scanCorner, styles.scanCornerTR]} />
            <View style={[styles.scanCorner, styles.scanCornerBL]} />
            <View style={[styles.scanCorner, styles.scanCornerBR]} />
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <BlurView intensity={80} style={styles.instructionBlur}>
            <View style={styles.instructionContent}>
              <Ionicons 
                name={scanMode === 'register' ? 'add-circle' : 'eye'} 
                size={24} 
                color="#3B82F6" 
              />
              <Text style={styles.instructionText}>
                {scanMode === 'register' 
                  ? 'Scan QR code to register new product' 
                  : 'Scan QR code to view product history'
                }
              </Text>
              {scanned && (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text style={styles.scanningText}>Processing...</Text>
                </View>
              )}
            </View>
          </BlurView>
        </View>
      </View>

      {/* Scan Again Button */}
      {scanned && (
        <Animated.View style={[styles.scanAgainContainer, { opacity: fadeAnimation }]}>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setScanned(false);
              if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
              }
            }}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.gradientButton}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Product History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={50} style={styles.modalBlur}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  style={styles.modalHeaderGradient}
                >
                  <View style={styles.modalHeaderContent}>
                    <Ionicons name="document-text" size={24} color="white" />
                    <Text style={styles.modalTitle}>Product History</Text>
                    <TouchableOpacity
                      style={styles.closeIconButton}
                      onPress={() => setShowHistory(false)}
                    >
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {productHistory && (
                <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
                  {/* Product Info Card */}
                  <View style={styles.productInfoCard}>
                    <View style={styles.productInfoHeader}>
                      <Ionicons name="cube" size={24} color="#3B82F6" />
                      <Text style={styles.productId}>{productHistory.productID}</Text>
                    </View>
                    
                    <View style={styles.productInfoContent}>
                      <View style={styles.infoRow}>
                        <Ionicons name="person" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Owner:</Text>
                        <Text style={styles.infoValue}>{productHistory.owner || 'Unknown'}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Ionicons 
                          name={getStatusIcon(productHistory.currentStatus)} 
                          size={16} 
                          color={getStatusColor(productHistory.currentStatus)} 
                        />
                        <Text style={styles.infoLabel}>Status:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(productHistory.currentStatus) }]}>
                          <Text style={styles.statusText}>{productHistory.currentStatus}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Created:</Text>
                        <Text style={styles.infoValue}>{formatDate(productHistory.createdAt)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* History Section */}
                  <View style={styles.historySection}>
                    <View style={styles.historySectionHeader}>
                      <Ionicons name="time" size={20} color="#3B82F6" />
                      <Text style={styles.historyTitle}>Activity History</Text>
                    </View>
                    
                    {productHistory.history && productHistory.history.length > 0 ? (
                      <View style={styles.historyList}>
                        {productHistory.history.map((event: any, index: number) => (
                          <View key={index} style={styles.historyItem}>
                            <View style={styles.historyItemLeft}>
                              <View style={[styles.historyDot, { backgroundColor: getStatusColor(event.status) }]} />
                              {index < productHistory.history.length - 1 && <View style={styles.historyLine} />}
                            </View>
                            <View style={styles.historyItemContent}>
                              <View style={styles.historyItemHeader}>
                                <Text style={styles.historyStatus}>{event.status}</Text>
                                <Text style={styles.historyTime}>{formatDate(event.timestamp)}</Text>
                              </View>
                              <Text style={styles.historyActor}>by {event.actor}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.noHistoryContainer}>
                        <Ionicons name="information-circle" size={48} color="#D1D5DB" />
                        <Text style={styles.noHistory}>No activity history available</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}

              {/* Close Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowHistory(false)}
                >
                  <LinearGradient
                    colors={['#6B7280', '#4B5563']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <BlurView intensity={80} style={styles.loadingBlur}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingOverlayText}>
                {scanMode === 'register' ? 'Registering product...' : 'Fetching history...'}
              </Text>
            </View>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userEmail: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  modeContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modeBlur: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  modeContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeMode: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modeText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  activeModeText: {
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#3B82F6',
    borderRadius: 4,
  },
  scanCornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderLeftWidth: 0,
  },
  scanCornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderTopWidth: 0,
  },
  scanCornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  instructionBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  instructionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanningText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  scanAgainContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  scanAgainButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  modalHeader: {
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeIconButton: {
    padding: 4,
  },
  historyContainer: {
    maxHeight: height * 0.6,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  productInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  productId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  productInfoContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  historySection: {
    marginBottom: 24,
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  historyList: {
    paddingLeft: 8,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyItemLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  historyLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  historyItemContent: {
    flex: 1,
    paddingBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyActor: {
    fontSize: 12,
    color: '#6B7280',
  },
  noHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noHistory: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 32,
    borderRadius: 16,
    gap: 16,
  },
  loadingOverlayText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});
