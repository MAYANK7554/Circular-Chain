import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

interface Product {
  id: string;
  productID: string;
  currentStatus: string;
  owner: string;
  createdAt: string;
  history: Array<{
    status: string;
    timestamp: string;
    actor: string;
  }>;
}

interface Stats {
  totalProducts: number;
  myProducts: number;
  likeNew: number;
  refurbished: number;
  recycled: number;
  weeklyGrowth: number;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    myProducts: 0,
    likeNew: 0,
    refurbished: 0,
    recycled: 0,
    weeklyGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, signOut } = useAuth();
  const router = useRouter();
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchProducts();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://192.168.1.6:3001/api/returns');
      setProducts(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (products: Product[]) => {
    const total = products.length;
    const myProducts = products.filter(p => p.owner?.toLowerCase() === user?.email?.toLowerCase()).length;
    const likeNew = products.filter(p => p.currentStatus === 'Like New').length;
    const refurbished = products.filter(p => p.currentStatus === 'Needs Refurbishment').length;
    const recycled = products.filter(p => p.currentStatus === 'Recycle').length;
    
    setStats({
      totalProducts: total,
      myProducts,
      likeNew,
      refurbished,
      recycled,
      weeklyGrowth: Math.floor(Math.random() * 20) + 5, // Mock growth
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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

  const recentProducts = products
    .filter(p => p.owner?.toLowerCase() === user?.email?.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
              <View style={styles.logoContainer}>
                <Image 

source={require('../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.appName}>CircularChain</Text>
                <Text style={styles.tagline}>Sustainable Future</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => {
                // Show profile menu or navigate to profile
              }}
            >
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnimation, transform: [{ translateY: slideAnimation }] }]}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.myProducts}</Text>
            <Text style={styles.statLabel}>My Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.likeNew}</Text>
            <Text style={styles.statLabel}>Like New</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.refurbished}</Text>
            <Text style={styles.statLabel}>Refurbished</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.recycled}</Text>
            <Text style={styles.statLabel}>Recycled</Text>
          </View>
        </View>
        
        {/* Recent Products */}
        <View style={styles.recentProductsContainer}>
          <Text style={styles.sectionTitle}>Recent Products</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentProductsScroll}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                progressBackgroundColor="#1F2937"
              />
            }
          >
            {recentProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No recent products found.</Text>
              </View>
            ) : (
              recentProducts.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/product/${product.productID}`)}
                >
                  <View style={styles.productStatus}>
                    <Ionicons name={getStatusIcon(product.currentStatus)} size={16} color="#fff" />
                    <Text style={styles.productStatusText}>{product.currentStatus}</Text>
                  </View>
                  <Text style={styles.productTitle}>{product.productID}</Text>
                  <Text style={styles.productOwner}>{product.owner}</Text>
                  <Text style={styles.productDate}>{formatDate(new Date(product.createdAt))}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
        
        {/* Call to Action */}
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={() => router.push('/(tabs)/scanner')}
        >
          <Text style={styles.ctaButtonText}>Scan Product to Begin</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#3B82F6',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 100,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 6,
  },
  logo: {
    width: 28,
    height: 28,
  },
  appName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagline: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 2,
  },
  profileInfo: {
    marginRight: 10,
  },
  greeting: {
    color: '#3B82F6',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeContainer: {
    marginTop: 10,
  },
  timeText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 120,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  statValue: {
    color: '#3B82F6',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  recentProductsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recentProductsScroll: {
    paddingVertical: 10,
  },
  emptyState: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
  },
  productCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    elevation: 2,
  },
  productStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  productStatusText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  productTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  productOwner: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 5,
  },
  productDate: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
