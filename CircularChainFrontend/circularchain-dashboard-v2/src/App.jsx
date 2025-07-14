import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  useToast,
  Badge,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Heading,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  useColorModeValue,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  InputGroup,
  InputLeftElement,
  Spacer,
  Circle,
  Collapse,
  FormErrorMessage,
  Select,
  Switch,
  FormHelperText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Image,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorMode
} from '@chakra-ui/react';
import { 
  FiHome, 
  FiPackage, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiShare2, 
  FiPlus, 
  FiEye, 
  FiTrash2, 
  FiMoreVertical, 
  FiChevronDown, 
  FiChevronUp, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiUserPlus, 
  FiShield, 
  FiBarChart, 
  FiUsers, 
  FiHelpCircle, 
  FiSun, 
  FiMoon, 
  FiMenu, 
  FiBell,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiSend,
  FiInbox,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { auth, googleProvider } from './firebaseconfig';
import { signInWithEmailAndPassword, signOut, signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import axios from 'axios';

function App() {
  // All state declarations
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [transferProductId, setTransferProductId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [stats, setStats] = useState({
    totalProducts: 0,
    likeNew: 0,
    refurbished: 0,
    recycled: 0,
    weeklyGrowth: 0
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // New state for buying inquiry
  const [buyingInquiries, setBuyingInquiries] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inquiryData, setInquiryData] = useState({
    message: '',
    offerPrice: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    urgency: 'medium'
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryView, setInquiryView] = useState('received'); // 'received' or 'sent'

  // Add this missing useDisclosure hook for the sidebar drawer
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Modal hooks - you already have these, just make sure they're all there
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();
  const { isOpen: isBuyingInquiryOpen, onOpen: onBuyingInquiryOpen, onClose: onBuyingInquiryClose } = useDisclosure();
  const { isOpen: isInquiryManagementOpen, onOpen: onInquiryManagementOpen, onClose: onInquiryManagementClose } = useDisclosure();

  // Also add the missing useColorMode hook
  const { colorMode, toggleColorMode } = useColorMode();

  const toast = useToast();
  const cancelRef = useRef();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Unknown Date'
      : date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'like new':
        return 'green';
      case 'needs refurbishment':
        return 'yellow';
      case 'recycle':
        return 'red';
      case 'pending':
        return 'yellow';
      case 'accepted':
        return 'green';
      case 'declined':
        return 'red';
      default:
        return 'gray';
    }
  };

  const toggleHistoryExpansion = (productId) => {
    setExpandedHistory(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    onClose();
  };

  // All useEffect hooks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProducts();
      const intervalId = setInterval(fetchProducts, 5000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  useEffect(() => {
    if (products.length > 0) {
      calculateStats(products);
    }
  }, [products]);

  useEffect(() => {
    if (user) {
      fetchBuyingInquiries();
    }
  }, [user]);

  // API functions
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/returns');
      setProducts(response.data);
    } catch (error) { 
      console.error("Error fetching products:", error); 
    }
  };

  const handleSignIn = async () => { 
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider()); 
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Sign in failed:", error);
      toast({
        title: "Sign In Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => { 
    try {
      await signOut(auth); 
      setProducts([]);
      toast({
        title: "Signed Out",
        description: "Successfully signed out",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleUpdateStatus = async (productId, newStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/returns/${productId}/status`, { newStatus });
      toast({ 
        title: "Status Updated", 
        description: `Product marked as ${newStatus}`,
        status: "success", 
        duration: 2000, 
        isClosable: true 
      });
      fetchProducts();
    } catch (error) { 
      console.error("Update failed:", error);
      toast({ 
        title: "Update Failed", 
        description: error.message,
        status: "error", 
        duration: 2000, 
        isClosable: true 
      }); 
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3001/api/returns/${deleteProductId}`);
      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchProducts();
      onDeleteClose();
      setDeleteProductId(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete product",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (productId) => {
    setDeleteProductId(productId);
    onDeleteOpen();
  };

  const handleTransferOwnership = async () => {
    if (!transferProductId || !transferEmail) return;
    
    setIsTransferring(true);
    try {
      await axios.post(`http://localhost:3001/api/returns/${transferProductId}/transfer`, {
        newOwnerEmail: transferEmail.toLowerCase()
      });
      
      toast({
        title: "Ownership Transferred",
        description: `Product transferred to ${transferEmail}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      fetchProducts();
      onTransferClose();
      setTransferProductId(null);
      setTransferEmail('');
    } catch (error) {
      console.error("Transfer failed:", error);
      toast({
        title: "Transfer Failed",
        description: error.response?.data?.error || "Failed to transfer ownership",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const openTransferModal = (productId) => {
    setTransferProductId(productId);
    onTransferOpen();
  };

  const openBuyingInquiry = (product) => {
    setSelectedProduct(product);
    setInquiryData({
      message: '',
      offerPrice: '',
      buyerName: user?.displayName || '',
      buyerEmail: user?.email || '',
      buyerPhone: '',
      urgency: 'medium'
    });
    onBuyingInquiryOpen();
  };

  const submitBuyingInquiry = async () => {
    if (!selectedProduct || !inquiryData.message || !inquiryData.buyerName || !inquiryData.buyerEmail) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const inquiryPayload = {
        productId: selectedProduct.id,
        productOwner: selectedProduct.owner,
        buyerEmail: inquiryData.buyerEmail,
        buyerName: inquiryData.buyerName,
        buyerPhone: inquiryData.buyerPhone,
        message: inquiryData.message,
        offerPrice: inquiryData.offerPrice ? parseFloat(inquiryData.offerPrice) : null,
        urgency: inquiryData.urgency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        productDetails: {
          productID: selectedProduct.productID,
          currentStatus: selectedProduct.currentStatus
        }
      };

      // Send to backend
      const response = await axios.post('http://192.168.1.6:3001/api/buying-inquiries', inquiryPayload);
      
      // Update local state
      setBuyingInquiries(prev => [...prev, response.data]);

      toast({
        title: 'Inquiry Sent Successfully! 📧',
        description: `Your buying inquiry has been sent to ${selectedProduct.owner}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onBuyingInquiryClose();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error submitting buying inquiry:', error);
      toast({
        title: 'Failed to Send Inquiry',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const fetchBuyingInquiries = async () => {
    try {
      const response = await axios.get(`http://192.168.1.6:3001/api/buying-inquiries?email=${user?.email}`);
      setBuyingInquiries(response.data);
    } catch (error) {
      console.error('Error fetching buying inquiries:', error);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus, response = '') => {
    try {
      await axios.put(`http://192.168.1.6:3001/api/buying-inquiries/${inquiryId}`, {
        status: newStatus,
        response: response,
        respondedAt: new Date().toISOString()
      });

      setBuyingInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, status: newStatus, response, respondedAt: new Date().toISOString() }
            : inquiry
        )
      );

      toast({
        title: 'Response Sent',
        description: `Inquiry ${newStatus === 'accepted' ? 'accepted' : 'declined'} successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inquiry status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Statistics calculation
  const calculateStats = (products) => {
    const total = products.length;
    const likeNew = products.filter(p => p.currentStatus === 'Like New').length;
    const refurbished = products.filter(p => p.currentStatus === 'Needs Refurbishment').length;
    const recycled = products.filter(p => p.currentStatus === 'Recycle').length;
    
    setStats({
      totalProducts: total,
      likeNew,
      refurbished,
      recycled,
      weeklyGrowth: Math.floor(Math.random() * 20)
    });
  };

  // Filtering and sorting
  const getFilteredAndSortedProducts = () => {
    let filtered = currentView === 'products' ? products : products.filter(product => 
      product.owner?.toLowerCase() === user?.email?.toLowerCase()
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => 
        product.currentStatus?.toLowerCase().includes(filterStatus.toLowerCase())
      );
    }

    filtered = filtered.filter(product =>
      product.productID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.currentStatus?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'status':
        filtered.sort((a, b) => a.currentStatus.localeCompare(b.currentStatus));
        break;
      default:
        break;
    }

    return filtered;
  };

  const productsToShow = getFilteredAndSortedProducts();

  // Loading state
  if (loading) {
    return (
      <Container centerContent py={20}>
        <VStack spacing={6}>
          <Image src="/logo.png" alt="CircularChain Logo" h="120px" w="auto" maxW="300px" objectFit="contain" />
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading CircularChain...</Text>
        </VStack>
      </Container>
    );
  }
  
  // Login screen
  if (!user) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <Container maxW="md">
          <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="2xl" border="1px" borderColor={borderColor}>
            <VStack spacing={8}>
              <VStack spacing={4}>
                <Image src="/logo.png" alt="CircularChain Logo" h="150px" w="auto" maxW="400px" objectFit="contain" />
                <Heading size="xl" color="blue.600" textAlign="center">CircularChain</Heading>
                <Text fontSize="lg" color="gray.600" textAlign="center">Sustainable Product Management</Text>
              </VStack>
              
              <Button
                colorScheme="blue"
                size="lg"
                width="100%"
                onClick={handleSignIn}
                isLoading={isSigningIn}
                loadingText="Signing in..."
                py={6}
                fontSize="lg"
                fontWeight="semibold"
                borderRadius="lg"
              >
                Sign in with Google
              </Button>
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Use your Google account to access the dashboard
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  // Main dashboard
  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Transfer Ownership Modal */}
      <Modal isOpen={isTransferOpen} onClose={onTransferClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer Ownership</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Enter the email address of the new owner:</Text>
              <Input
                placeholder="new-owner@example.com"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                type="email"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTransferClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleTransferOwnership}
              isLoading={isTransferring}
              loadingText="Transferring..."
              isDisabled={!transferEmail}
            >
              Transfer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Product</AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to delete this product? This action cannot be undone.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteProduct} ml={3} isLoading={isDeleting} loadingText="Deleting...">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Buying Inquiry Modal */}
      <Modal isOpen={isBuyingInquiryOpen} onClose={onBuyingInquiryClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiDollarSign />
              <Text>Send Buying Inquiry</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <VStack spacing={4} align="stretch">
                {/* Product Info */}
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" fontSize="lg">{selectedProduct.productID}</Text>
                    <HStack>
                      <Badge colorScheme={getStatusColor(selectedProduct.currentStatus)}>
                        {selectedProduct.currentStatus}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        Owner: {selectedProduct.owner}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Inquiry Form */}
                <FormControl isRequired>
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    value={inquiryData.buyerName}
                    onChange={(e) => setInquiryData({...inquiryData, buyerName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Your Email</FormLabel>
                  <Input
                    type="email"
                    value={inquiryData.buyerEmail}
                    onChange={(e) => setInquiryData({...inquiryData, buyerEmail: e.target.value})}
                    placeholder="Enter your email address"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    value={inquiryData.buyerPhone}
                    onChange={(e) => setInquiryData({...inquiryData, buyerPhone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Offer Price ($)</FormLabel>
                  <NumberInput
                    value={inquiryData.offerPrice}
                    onChange={(value) => setInquiryData({...inquiryData, offerPrice: value})}
                    min={0}
                  >
                    <NumberInputField placeholder="Enter your offer price (optional)" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Leave empty if price is negotiable</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Urgency</FormLabel>
                  <Select
                    value={inquiryData.urgency}
                    onChange={(e) => setInquiryData({...inquiryData, urgency: e.target.value})}
                  >
                    <option value="low">Low - No rush</option>
                    <option value="medium">Medium - Reasonable timeframe</option>
                    <option value="high">High - Urgent</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    value={inquiryData.message}
                    onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                    placeholder="Please provide details about your interest in this product, intended use, or any questions you have..."
                    rows={4}
                  />
                  <FormHelperText>Be specific about your requirements and timeline</FormHelperText>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBuyingInquiryClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={submitBuyingInquiry}
              isLoading={isSubmittingInquiry}
              loadingText="Sending..."
              leftIcon={<FiSend />}
            >
              Send Inquiry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Inquiry Management Modal */}
      <Modal isOpen={isInquiryManagementOpen} onClose={onInquiryManagementClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiInbox />
              <Text>Buying Inquiries</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs index={inquiryView === 'received' ? 0 : 1} onChange={(index) => setInquiryView(index === 0 ? 'received' : 'sent')}>
              <TabList>
                <Tab>
                  <HStack>
                    <FiInbox />
                    <Text>Received</Text>
                    <Badge colorScheme="blue">
                      {buyingInquiries.filter(i => i.productOwner?.toLowerCase() === user?.email?.toLowerCase()).length}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiSend />
                    <Text>Sent</Text>
                    <Badge colorScheme="green">
                      {buyingInquiries.filter(i => i.buyerEmail?.toLowerCase() === user?.email?.toLowerCase()).length}
                    </Badge>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {buyingInquiries.filter(i => i.productOwner?.toLowerCase() === user?.email?.toLowerCase()).length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <FiInbox size={48} color="gray.400" />
                        <Text color="gray.500" mt={4}>No inquiries received yet</Text>
                      </Box>
                    ) : (
                      buyingInquiries.filter(i => i.productOwner?.toLowerCase() === user?.email?.toLowerCase()).map((inquiry) => (
                        <Card key={inquiry.id} variant="outline">
                          <CardHeader>
                            <Flex justify="space-between" align="start">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{inquiry.productDetails.productID}</Text>
                                <HStack>
                                  <Badge colorScheme={getStatusColor(inquiry.status)}>
                                    {inquiry.status}
                                  </Badge>
                                  <Badge colorScheme={getUrgencyColor(inquiry.urgency)}>
                                    {inquiry.urgency} priority
                                  </Badge>
                                </HStack>
                              </VStack>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </Text>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <Box>
                                <Text fontWeight="semibold" mb={1}>From:</Text>
                                <Text>{inquiry.buyerName} ({inquiry.buyerEmail})</Text>
                                {inquiry.buyerPhone && (
                                  <Text fontSize="sm" color="gray.600">Phone: {inquiry.buyerPhone}</Text>
                                )}
                              </Box>
                              {inquiry.offerPrice && (
                                <Box>
                                  <Text fontWeight="semibold" mb={1}>Offer Price:</Text>
                                  <Text color="green.500" fontSize="lg" fontWeight="bold">
                                    ${inquiry.offerPrice}
                                  </Text>
                                </Box>
                              )}
                              <Box>
                                <Text fontWeight="semibold" mb={1}>Message:</Text>
                                <Text>{inquiry.message}</Text>
                              </Box>
                              {inquiry.response && (
                                <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                                  <Text fontWeight="semibold" mb={1}>Your Response:</Text>
                                  <Text>{inquiry.response}</Text>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                          {inquiry.status === 'pending' && (
                            <CardFooter>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  leftIcon={<FiCheck />}
                                  onClick={() => updateInquiryStatus(inquiry.id, 'accepted', 'Inquiry accepted! Please contact me to proceed.')}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  leftIcon={<FiX />}
                                  onClick={() => updateInquiryStatus(inquiry.id, 'declined', 'Thank you for your interest, but this item is not available.')}
                                >
                                  Decline
                                </Button>
                              </HStack>
                            </CardFooter>
                          )}
                        </Card>
                      ))
                    )}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {buyingInquiries.filter(i => i.buyerEmail?.toLowerCase() === user?.email?.toLowerCase()).length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <FiSend size={48} color="gray.400" />
                        <Text color="gray.500" mt={4}>No inquiries sent yet</Text>
                      </Box>
                    ) : (
                      buyingInquiries.filter(i => i.buyerEmail?.toLowerCase() === user?.email?.toLowerCase()).map((inquiry) => (
                        <Card key={inquiry.id} variant="outline">
                          <CardHeader>
                            <Flex justify="space-between" align="start">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{inquiry.productDetails.productID}</Text>
                                <HStack>
                                  <Badge colorScheme={getStatusColor(inquiry.status)}>
                                    {inquiry.status}
                                  </Badge>
                                  <Badge colorScheme={getUrgencyColor(inquiry.urgency)}>
                                    {inquiry.urgency} priority
                                  </Badge>
                                </HStack>
                              </VStack>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </Text>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <Box>
                                <Text fontWeight="semibold" mb={1}>To:</Text>
                                <Text>{inquiry.productOwner}</Text>
                              </Box>
                              {inquiry.offerPrice && (
                                <Box>
                                  <Text fontWeight="semibold" mb={1}>Your Offer:</Text>
                                  <Text color="green.500" fontSize="lg" fontWeight="bold">
                                    ${inquiry.offerPrice}
                                  </Text>
                                </Box>
                              )}
                              <Box>
                                <Text fontWeight="semibold" mb={1}>Your Message:</Text>
                                <Text>{inquiry.message}</Text>
                              </Box>
                              {inquiry.response && (
                                <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                                  <Text fontWeight="semibold" mb={1}>Owner's Response:</Text>
                                  <Text>{inquiry.response}</Text>
                                  <Text fontSize="sm" color="gray.600" mt={2}>
                                    Responded on {new Date(inquiry.respondedAt).toLocaleDateString()}
                                  </Text>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Circle size="40px" bg="blue.500" color="white">
                <FiPackage />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">CircularChain</Text>
                <Text fontSize="xs" color="gray.500">v2.0</Text>
              </VStack>
            </HStack>
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {/* User Profile Card */}
              <Box p={6} bg={useColorModeValue('blue.50', 'blue.900')}>
                <VStack spacing={4}>
                  <Avatar 
                    size="xl" 
                    name={user?.displayName} 
                    src={user?.photoURL} 
                    border="4px solid" 
                    borderColor="white"
                    shadow="xl"
                  />
                  <VStack spacing={1}>
                    <Text fontWeight="bold" fontSize="lg">{user?.displayName}</Text>
                    <Text fontSize="sm" color="gray.600">{user?.email}</Text>
                    <Badge colorScheme="green" variant="solid" fontSize="xs">
                      Active User
                    </Badge>
                  </VStack>
                </VStack>
              </Box>

              {/* Navigation */}
              <VStack spacing={1} p={4} align="stretch">
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} px={3}>
                  NAVIGATION
                </Text>
                
                <Button 
                  leftIcon={<FiHome />} 
                  variant={currentView === 'dashboard' ? 'solid' : 'ghost'} 
                  justifyContent="flex-start" 
                  size="lg"
                  onClick={() => handleViewChange('dashboard')}
                  colorScheme="blue"
                  _hover={{ bg: 'blue.50' }}
                >
                  Dashboard
                </Button>
                
                <Button
                  leftIcon={<FiPackage />}
                  variant={currentView === 'products' ? 'solid' : 'ghost'}
                  justifyContent="flex-start"
                  size="lg"
                  onClick={() => handleViewChange('products')}
                  colorScheme="blue"
                  _hover={{ bg: 'blue.50' }}
                >
                  <HStack justify="space-between" w="100%">
                    <Text>Products</Text>
                    <Badge colorScheme="gray" variant="solid" fontSize="xs">
                      {products.length}
                    </Badge>
                  </HStack>
                </Button>
                
                <Button
                  leftIcon={<FiInbox />}
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  onClick={onInquiryManagementOpen}
                  colorScheme="blue"
                  _hover={{ bg: 'blue.50' }}
                >
                  <HStack justify="space-between" w="100%">
                    <Text>Buying Inquiries</Text>
                    <Badge colorScheme="green" variant="solid" fontSize="xs">
                      {buyingInquiries.filter(i => i.status === 'pending').length}
                    </Badge>
                  </HStack>
                </Button>
                
                <Button 
                  leftIcon={<FiBarChart />} 
                  variant="ghost" 
                  justifyContent="flex-start" 
                  size="lg"
                  _hover={{ bg: 'blue.50' }}
                >
                  Analytics
                </Button>
                
                <Button 
                  leftIcon={<FiUsers />} 
                  variant="ghost" 
                  justifyContent="flex-start" 
                  size="lg"
                  _hover={{ bg: 'blue.50' }}
                >
                  Partners
                </Button>
              </VStack>

              <Divider />

              {/* Quick Stats */}
              <VStack p={4} spacing={3}>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                  QUICK STATS
                </Text>
                <SimpleGrid columns={2} spacing={3} w="100%">
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Total</StatLabel>
                    <StatNumber fontSize="lg">{stats.totalProducts}</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Like New</StatLabel>
                    <StatNumber fontSize="lg" color="green.500">{stats.likeNew}</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Refurbish</StatLabel>
                    <StatNumber fontSize="lg" color="yellow.500">{stats.refurbished}</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Recycle</StatLabel>
                    <StatNumber fontSize="lg" color="red.500">{stats.recycled}</StatNumber>
                  </Stat>
                </SimpleGrid>
              </VStack>

              <Divider />

              {/* Settings */}
              <VStack spacing={1} p={4} align="stretch">
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2}>
                  SETTINGS
                </Text>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <HStack>
                    <Box color={colorMode === 'dark' ? 'yellow.400' : 'gray.500'}>
                      {colorMode === 'dark' ? <FiMoon /> : <FiSun />}
                    </Box>
                    <FormLabel htmlFor="dark-mode" mb="0" fontSize="sm">
                      Dark Mode
                    </FormLabel>
                  </HStack>
                  <Switch 
                    id="dark-mode" 
                    colorScheme="blue" 
                    isChecked={colorMode === 'dark'} 
                    onChange={toggleColorMode} 
                  />
                </FormControl>
                
                <Button 
                  leftIcon={<FiSettings />} 
                  variant="ghost" 
                  justifyContent="flex-start" 
                  size="sm"
                  _hover={{ bg: 'blue.50' }}
                >
                  Preferences
                </Button>
                
                <Button 
                  leftIcon={<FiHelpCircle />} 
                  variant="ghost" 
                  justifyContent="flex-start" 
                  size="sm"
                  _hover={{ bg: 'blue.50' }}
                >
                  Help & Support
                </Button>
              </VStack>

              <Divider />

              <Box p={4}>
                <Button 
                  leftIcon={<FiLogOut />} 
                  colorScheme="red" 
                  variant="ghost" 
                  justifyContent="flex-start" 
                  size="lg" 
                  onClick={handleSignOut}
                  w="100%"
                >
                  Sign Out
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
            <HStack spacing={4}>
              <IconButton 
                icon={<FiMenu />} 
                onClick={onOpen} 
                variant="ghost" 
                size="lg" 
                aria-label="Open menu"
                bg={useColorModeValue('white', 'gray.800')}
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
              />
              
              <VStack align="start" spacing={0}>
                <Heading as="h1" size="xl" color={useColorModeValue('gray.800', 'white')}>
                  {currentView === 'dashboard' ? 'Dashboard' : 'All Products'}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  {currentView === 'dashboard' 
                    ? `Welcome back, ${user?.displayName}!` 
                    : 'Manage all products in the system'
                  }
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <Tooltip label="Notifications">
                <IconButton 
                  icon={<FiBell />} 
                  variant="ghost" 
                  size="md"
                  bg={useColorModeValue('white', 'gray.800')}
                  border="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                />
              </Tooltip>
              
              <Menu>
                <MenuButton as={Button} variant="ghost" p={0}>
                  <Avatar 
                    size="md" 
                    name={user?.displayName} 
                    src={user?.photoURL} 
                    border="2px solid" 
                    borderColor="blue.500" 
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiUser />}>Profile</MenuItem>
                  <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                  <MenuItem icon={<FiLogOut />} onClick={handleSignOut}>
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="lg" borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Total Products</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {stats.totalProducts}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {stats.weeklyGrowth}% this week
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={useColorModeValue('white', 'gray.800')} shadow="lg" borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Like New</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">
                    {stats.likeNew}
                  </StatNumber>
                  <StatHelpText>
                    {stats.totalProducts > 0 
                      ? `${Math.round((stats.likeNew / stats.totalProducts) * 100)}% of total`
                      : '0% of total'
                    }
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={useColorModeValue('white', 'gray.800')} shadow="lg" borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Refurbishment</StatLabel>
                  <StatNumber fontSize="2xl" color="yellow.500">
                    {stats.refurbished}
                  </StatNumber>
                  <StatHelpText>
                    {stats.totalProducts > 0 
                      ? `${Math.round((stats.refurbished / stats.totalProducts) * 100)}% of total`
                      : '0% of total'
                    }
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={useColorModeValue('white', 'gray.800')} shadow="lg" borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Recycled</StatLabel>
                  <StatNumber fontSize="2xl" color="red.500">
                    {stats.recycled}
                  </StatNumber>
                  <StatHelpText>
                    {stats.totalProducts > 0 
                      ? `${Math.round((stats.recycled / stats.totalProducts) * 100)}% of total`
                      : '0% of total'
                    }
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters and Controls */}
          <Card bg={useColorModeValue('white', 'gray.800')} shadow="lg" borderWidth="1px" p={6}>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={4} 
              align={{ base: 'stretch', md: 'center' }}
              justify="space-between"
            >
              <HStack spacing={4} flex={1}>
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    border="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                  />
                </InputGroup>

                <Menu>
                  <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="outline">
                    <HStack>
                      <FiFilter />
                      <Text>Filter</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setFilterStatus('all')}>All Status</MenuItem>
                    <MenuItem onClick={() => setFilterStatus('like new')}>Like New</MenuItem>
                    <MenuItem onClick={() => setFilterStatus('refurbishment')}>Refurbishment</MenuItem>
                    <MenuItem onClick={() => setFilterStatus('recycle')}>Recycle</MenuItem>
                  </MenuList>
                </Menu>

                <Menu>
                  <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="outline">
                    Sort
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setSortBy('newest')}>Newest First</MenuItem>
                    <MenuItem onClick={() => setSortBy('oldest')}>Oldest First</MenuItem>
                    <MenuItem onClick={() => setSortBy('status')}>By Status</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>

              <HStack spacing={2}>
                <Tooltip label="Export Data">
                  <IconButton icon={<FiDownload />} variant="outline" />
                </Tooltip>
                <Tooltip label="Share">
                  <IconButton icon={<FiShare2 />} variant="outline" />
                </Tooltip>
                <Button leftIcon={<FiPlus />} colorScheme="blue" size="md">
                  Add Product
                </Button>
              </HStack>
            </Flex>
          </Card>

          {/* Product Grid */}
          {productsToShow.length > 0 ? (
            <Grid templateColumns="repeat(auto-fill, minmax(380px, 1fr))" gap={6}>
              {productsToShow.map(product => (
                <GridItem key={product.id}>
                  <Card 
                    bg={useColorModeValue('white', 'gray.800')} 
                    shadow="lg" 
                    borderWidth="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    borderRadius="xl" 
                    overflow="hidden"
                    transition="all 0.3s"
                    _hover={{ 
                      transform: 'translateY(-4px)', 
                      shadow: '2xl',
                      borderColor: 'blue.300'
                    }}
                  >
                    <CardHeader pb={3}>
                      <Flex justifyContent="space-between" alignItems="start">
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Circle size="10px" bg={`${getStatusColor(product.currentStatus)}.500`} />
                            <Heading size="md" color={useColorModeValue('gray.800', 'white')}>
                              {product.productID}
                            </Heading>
                          </HStack>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.500">
                              <FiCalendar style={{ display: 'inline', marginRight: '4px' }} />
                              {formatDate(product.createdAt)}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              <FiUser style={{ display: 'inline', marginRight: '4px' }} />
                              {product.owner || 'Unknown'}
                            </Text>
                          </VStack>
                        </VStack>
                        <VStack align="end" spacing={2}>
                          <Badge 
                            colorScheme={getStatusColor(product.currentStatus)} 
                            variant="solid" 
                            borderRadius="full" 
                            px={3} 
                            py={1}
                            fontSize="xs"
                          >
                            {product.currentStatus}
                          </Badge>
                          <Menu>
                            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                            <MenuList>
                              <MenuItem icon={<FiEye />}>View Details</MenuItem>
                              {product.owner?.toLowerCase() !== user?.email?.toLowerCase() && 
                               (product.currentStatus === 'Like New' || product.currentStatus === 'Needs Refurbishment') && (
                                <MenuItem 
                                  icon={<FiDollarSign />} 
                                  onClick={() => openBuyingInquiry(product)}
                                  color="green.500"
                                >
                                  Send Buying Inquiry
                                </MenuItem>
                              )}
                              {product.owner?.toLowerCase() === user?.email?.toLowerCase() && (
                                <MenuItem 
                                  icon={<FiUserPlus />} 
                                  onClick={() => openTransferModal(product.id)}
                                >
                                  Transfer Ownership
                                </MenuItem>
                              )}
                              <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => confirmDelete(product.id)}>
                                Delete Product
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </VStack>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      {/* Product history and details */}
                      <VStack align="stretch" spacing={4}>
                        {/* Product Status History */}
                        <Box>
                          <Text fontWeight="semibold" mb={2}>Status History</Text>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleHistoryExpansion(product.id)}
                            mb={2}
                            rightIcon={expandedHistory[product.id] ? <FiChevronUp /> : <FiChevronDown />}
                          >
                            {expandedHistory[product.id] ? 'Hide History' : 'Show History'}
                          </Button>
                          <Collapse in={expandedHistory[product.id]}>
                            <VStack align="start" spacing={1}>
                              {product.history && product.history.length > 0 ? (
                                product.history.map((entry, index) => (
                                  <HStack key={index} spacing={2}>
                                    <Circle size="8px" bg={`${getStatusColor(entry.status)}.500`} />
                                    <Text fontSize="sm" color="gray.600">
                                      {formatDate(entry.timestamp || product.createdAt)} - {entry.status}
                                    </Text>
                                  </HStack>
                                ))
                              ) : (
                                <Text fontSize="sm" color="gray.500">No status history available</Text>
                              )}
                            </VStack>
                          </Collapse>
                        </Box>

                        {/* Product Details */}
                        
                      </VStack>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <VStack w="100%" spacing={3}>
                        {product.owner?.toLowerCase() === user?.email?.toLowerCase() ? (
                          <>
                            <HStack w="100%" spacing={2}>
                              <Button 
                                size="sm" 
                                colorScheme="green" 
                                onClick={() => handleUpdateStatus(product.id, 'Like New')} 
                                leftIcon={<FiCheckCircle />} 
                                flex={1}
                              >
                                Like New
                              </Button>
                              <Button 
                                size="sm" 
                                colorScheme="yellow" 
                                onClick={() => handleUpdateStatus(product.id, 'Needs Refurbishment')} 
                                leftIcon={<FiRefreshCw />} 
                                flex={1}
                              >
                                Refurbish
                              </Button>
                            </HStack>
                            <HStack w="100%" spacing={2}>
                              <Button 
                                size="sm" 
                                colorScheme="red" 
                                onClick={() => handleUpdateStatus(product.id, 'Recycle')} 
                                leftIcon={<FiTrash2 />} 
                                flex={1} 
                                variant="outline"
                              >
                                Recycle
                              </Button>
                              <Button 
                                size="sm" 
                                colorScheme="blue" 
                                onClick={() => openTransferModal(product.id)} 
                                leftIcon={<FiUserPlus />} 
                                flex={1}
                                variant="outline"
                              >
                                Transfer
                              </Button>
                            </HStack>
                          </>
                        ) : (
                          <VStack w="100%" spacing={2}>
                            <Box 
                              w="100%" 
                              textAlign="center" 
                              py={3} 
                              bg={useColorModeValue('gray.50', 'gray.700')} 
                              borderRadius="md"
                              border="1px dashed"
                              borderColor="gray.300"
                            >
                              <VStack spacing={2}>
                                <FiShield color="gray.400" size={16} />
                                <Text fontSize="xs" color="gray.500">
                                  Owner: {product.owner || 'Unknown'}
                                </Text>
                              </VStack>
                            </Box>
                            {(product.currentStatus === 'Like New' || product.currentStatus === 'Needs Refurbishment') && (
                              <Button 
                                size="sm" 
                                colorScheme="green" 
                                onClick={() => openBuyingInquiry(product)}
                                leftIcon={<FiDollarSign />} 
                                w="100%"
                                variant="outline"
                              >
                                Send Buying Inquiry
                              </Button>
                            )}
                          </VStack>
                        )}
                      </VStack>
                    </CardFooter>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={20}>
              <FiPackage size={48} color="gray.400" />
              <Text color="gray.500" mt={4} fontSize="lg">
                No products found. Try adjusting your filters or adding a new product.
              </Text>
            </Box>
          )}
        </VStack>
      </Container>

      {/* Transfer Ownership Modal */}
      <Modal isOpen={isTransferOpen} onClose={onTransferClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer Ownership</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Enter the email address of the new owner:</Text>
              <Input
                placeholder="new-owner@example.com"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                type="email"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTransferClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleTransferOwnership}
              isLoading={isTransferring}
              loadingText="Transferring..."
              isDisabled={!transferEmail}
            >
              Transfer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Product</AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to delete this product? This action cannot be undone.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteProduct} ml={3} isLoading={isDeleting} loadingText="Deleting...">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Buying Inquiry Modal */}
      <Modal isOpen={isBuyingInquiryOpen} onClose={onBuyingInquiryClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiDollarSign />
              <Text>Send Buying Inquiry</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <VStack spacing={4} align="stretch">
                {/* Product Info */}
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" fontSize="lg">{selectedProduct.productID}</Text>
                    <HStack>
                      <Badge colorScheme={getStatusColor(selectedProduct.currentStatus)}>
                        {selectedProduct.currentStatus}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        Owner: {selectedProduct.owner}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Inquiry Form */}
                <FormControl isRequired>
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    value={inquiryData.buyerName}
                    onChange={(e) => setInquiryData({...inquiryData, buyerName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Your Email</FormLabel>
                  <Input
                    type="email"
                    value={inquiryData.buyerEmail}
                    onChange={(e) => setInquiryData({...inquiryData, buyerEmail: e.target.value})}
                    placeholder="Enter your email address"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    value={inquiryData.buyerPhone}
                    onChange={(e) => setInquiryData({...inquiryData, buyerPhone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Offer Price ($)</FormLabel>
                  <NumberInput
                    value={inquiryData.offerPrice}
                    onChange={(value) => setInquiryData({...inquiryData, offerPrice: value})}
                    min={0}
                  >
                    <NumberInputField placeholder="Enter your offer price (optional)" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Leave empty if price is negotiable</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Urgency</FormLabel>
                  <Select
                    value={inquiryData.urgency}
                    onChange={(e) => setInquiryData({...inquiryData, urgency: e.target.value})}
                  >
                    <option value="low">Low - No rush</option>
                    <option value="medium">Medium - Reasonable timeframe</option>
                    <option value="high">High - Urgent</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    value={inquiryData.message}
                    onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                    placeholder="Please provide details about your interest in this product, intended use, or any questions you have..."
                    rows={4}
                  />
                  <FormHelperText>Be specific about your requirements and timeline</FormHelperText>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBuyingInquiryClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={submitBuyingInquiry}
              isLoading={isSubmittingInquiry}
              loadingText="Sending..."
              leftIcon={<FiSend />}
            >
              Send Inquiry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Inquiry Management Modal */}
      <Modal isOpen={isInquiryManagementOpen} onClose={onInquiryManagementClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiInbox />
              <Text>Buying Inquiries</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs index={inquiryView === 'received' ? 0 : 1} onChange={(index) => setInquiryView(index === 0 ? 'received' : 'sent')}>
              <TabList>
                <Tab>
                  <HStack>
                    <FiInbox />
                    <Text>Received</Text>
                    <Badge colorScheme="blue">
                      {buyingInquiries.filter(i => i.productOwner?.toLowerCase() === user?.email?.toLowerCase()).length}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiSend />
                    <Text>Sent</Text>
                    <Badge colorScheme="green">
                      {buyingInquiries.filter(i => i.buyerEmail?.toLowerCase() === user?.email?.toLowerCase()).length}
                    </Badge>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {buyingInquiries.filter(i => i.productOwner?.toLowerCase() === user?.email?.toLowerCase()).length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <FiInbox size={48} color="gray.400" />
                        <Text color="gray.500" mt={4}>No inquiries received yet</Text>
                      </Box>
                    ) : (
                      buyingInquiries.filter(i => i.productOwner?.toLowerCase() === user?.email?.toLowerCase()).map((inquiry) => (
                        <Card key={inquiry.id} variant="outline">
                          <CardHeader>
                            <Flex justify="space-between" align="start">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{inquiry.productDetails.productID}</Text>
                                <HStack>
                                  <Badge colorScheme={getStatusColor(inquiry.status)}>
                                    {inquiry.status}
                                  </Badge>
                                  <Badge colorScheme={getUrgencyColor(inquiry.urgency)}>
                                    {inquiry.urgency} priority
                                  </Badge>
                                </HStack>
                              </VStack>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </Text>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <Box>
                                <Text fontWeight="semibold" mb={1}>From:</Text>
                                <Text>{inquiry.buyerName} ({inquiry.buyerEmail})</Text>
                                {inquiry.buyerPhone && (
                                  <Text fontSize="sm" color="gray.600">Phone: {inquiry.buyerPhone}</Text>
                                )}
                              </Box>
                              {inquiry.offerPrice && (
                                <Box>
                                  <Text fontWeight="semibold" mb={1}>Offer Price:</Text>
                                  <Text color="green.500" fontSize="lg" fontWeight="bold">
                                    ${inquiry.offerPrice}
                                  </Text>
                                </Box>
                              )}
                              <Box>
                                <Text fontWeight="semibold" mb={1}>Message:</Text>
                                <Text>{inquiry.message}</Text>
                              </Box>
                              {inquiry.response && (
                                <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                                  <Text fontWeight="semibold" mb={1}>Your Response:</Text>
                                  <Text>{inquiry.response}</Text>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                          {inquiry.status === 'pending' && (
                            <CardFooter>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  leftIcon={<FiCheck />}
                                  onClick={() => updateInquiryStatus(inquiry.id, 'accepted', 'Inquiry accepted! Please contact me to proceed.')}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  leftIcon={<FiX />}
                                  onClick={() => updateInquiryStatus(inquiry.id, 'declined', 'Thank you for your interest, but this item is not available.')}
                                >
                                  Decline
                                </Button>
                              </HStack>
                            </CardFooter>
                          )}
                        </Card>
                      ))
                    )}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {buyingInquiries.filter(i => i.buyerEmail?.toLowerCase() === user?.email?.toLowerCase()).length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <FiSend size={48} color="gray.400" />
                        <Text color="gray.500" mt={4}>No inquiries sent yet</Text>
                      </Box>
                    ) : (
                      buyingInquiries.filter(i => i.buyerEmail?.toLowerCase() === user?.email?.toLowerCase()).map((inquiry) => (
                        <Card key={inquiry.id} variant="outline">
                          <CardHeader>
                            <Flex justify="space-between" align="start">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{inquiry.productDetails.productID}</Text>
                                <HStack>
                                  <Badge colorScheme={getStatusColor(inquiry.status)}>
                                    {inquiry.status}
                                  </Badge>
                                  <Badge colorScheme={getUrgencyColor(inquiry.urgency)}>
                                    {inquiry.urgency} priority
                                  </Badge>
                                </HStack>
                              </VStack>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </Text>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <Box>
                                <Text fontWeight="semibold" mb={1}>To:</Text>
                                <Text>{inquiry.productOwner}</Text>
                              </Box>
                              {inquiry.offerPrice && (
                                <Box>
                                  <Text fontWeight="semibold" mb={1}>Your Offer:</Text>
                                  <Text color="green.500" fontSize="lg" fontWeight="bold">
                                    ${inquiry.offerPrice}
                                  </Text>
                                </Box>
                              )}
                              <Box>
                                <Text fontWeight="semibold" mb={1}>Your Message:</Text>
                                <Text>{inquiry.message}</Text>
                              </Box>
                              {inquiry.response && (
                                <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                                  <Text fontWeight="semibold" mb={1}>Owner's Response:</Text>
                                  <Text>{inquiry.response}</Text>
                                  <Text fontSize="sm" color="gray.600" mt={2}>
                                    Responded on {new Date(inquiry.respondedAt).toLocaleDateString()}
                                  </Text>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;