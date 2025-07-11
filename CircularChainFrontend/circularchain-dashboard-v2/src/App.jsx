import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { auth } from './firebaseconfig';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

import {
  Box, Button, Container, Heading, HStack, Text, useToast, VStack, Spinner, Avatar,
  Input, InputGroup, InputLeftElement, Badge, Grid, GridItem, Flex, IconButton, 
  useColorModeValue, Image, useColorMode, Drawer, DrawerBody, DrawerHeader, 
  DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Divider, 
  Menu, MenuButton, MenuList, MenuItem, Switch, FormControl, FormLabel,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogContent, AlertDialogOverlay, Card, CardHeader, CardBody, CardFooter
} from '@chakra-ui/react';

import { 
  FiSearch, FiPlus, FiStar, FiRefreshCw, FiTrash2, FiMenu, FiUser, FiLogOut, 
  FiMoon, FiSun, FiSettings, FiHome, FiBarChart, FiPackage, FiHelpCircle, 
  FiBell, FiMoreVertical
} from 'react-icons/fi';

function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://167.71.237.249:3001/api/returns');
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
      await axios.put(`http://167.71.237.249:3001/api/returns/${productId}/status`, { newStatus });
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
      await axios.delete(`http://167.71.237.249:3001/api/returns/${deleteProductId}`);
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

  const getStatusColor = (status) => {
    if (status?.includes('Like New')) return 'green';
    if (status?.includes('Refurbishment')) return 'orange';
    if (status?.includes('Recycle')) return 'red';
    if (status?.includes('Transferred')) return 'blue';
    return 'gray';
  };

  const filteredProducts = products.filter(product => 
    product.productID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.currentStatus?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Effects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

      {/* Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Image src="/logo.png" alt="CircularChain Logo" h="40px" w="auto" objectFit="contain" />
              <Text fontSize="lg" fontWeight="bold">CircularChain</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={4} align="stretch" p={4}>
              {/* Profile */}
              <VStack spacing={3} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
                <Avatar size="lg" name={user?.displayName} src={user?.photoURL} border="3px solid" borderColor="blue.500" />
                <Box textAlign="center">
                  <Text fontWeight="bold" fontSize="lg">{user?.displayName}</Text>
                  <Text fontSize="sm" color="gray.500">{user?.email}</Text>
                </Box>
              </VStack>

              <Divider />

              {/* Navigation */}
              <VStack spacing={2} align="stretch">
                <Button leftIcon={<FiHome />} variant="ghost" justifyContent="flex-start" size="lg">Dashboard</Button>
                <Button leftIcon={<FiPackage />} variant="ghost" justifyContent="flex-start" size="lg">Products ({products.length})</Button>
                <Button leftIcon={<FiBarChart />} variant="ghost" justifyContent="flex-start" size="lg">Analytics</Button>
                <Button leftIcon={<FiBell />} variant="ghost" justifyContent="flex-start" size="lg">Notifications</Button>
              </VStack>

              <Divider />

              {/* Settings */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="gray.500" px={3}>SETTINGS</Text>
                
                <FormControl display="flex" alignItems="center" px={3}>
                  <Box flex="1">
                    <HStack>
                      <Box color={colorMode === 'dark' ? 'yellow.400' : 'gray.500'}>
                        {colorMode === 'dark' ? <FiMoon /> : <FiSun />}
                      </Box>
                      <FormLabel htmlFor="dark-mode" mb="0" fontSize="sm">Dark Mode</FormLabel>
                    </HStack>
                  </Box>
                  <Switch id="dark-mode" colorScheme="blue" isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
                </FormControl>
                
                <Button leftIcon={<FiUser />} variant="ghost" justifyContent="flex-start" size="sm">My Profile</Button>
                <Button leftIcon={<FiSettings />} variant="ghost" justifyContent="flex-start" size="sm">Settings</Button>
                <Button leftIcon={<FiHelpCircle />} variant="ghost" justifyContent="flex-start" size="sm">Help & Support</Button>
              </VStack>

              <Divider />

              <Button leftIcon={<FiLogOut />} colorScheme="red" variant="ghost" justifyContent="flex-start" size="lg" onClick={handleSignOut}>
                Sign Out
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
            <HStack spacing={6}>
              <IconButton icon={<FiMenu />} onClick={onOpen} variant="ghost" size="lg" aria-label="Open menu" />
              <Image src="/logo.png" alt="CircularChain Logo" h="80px" w="auto" maxW="200px" objectFit="contain" />
              <Box>
                <Heading as="h1" size="2xl" color="gray.800" mb={2}>CircularChain Dashboard</Heading>
                <Text color="gray.600" fontSize="lg">
                  Welcome back, {user.displayName}! 
                  <Badge ml={2} colorScheme="yellow" variant="subtle">{filteredProducts.length} Items</Badge>
                </Text>
              </Box>
            </HStack>
            
            <HStack spacing={3}>
              <Avatar size="md" name={user.displayName} src={user.photoURL} border="2px solid" borderColor="blue.500" />
              <Button size="sm" variant="outline" colorScheme="red" onClick={handleSignOut}>Sign Out</Button>
            </HStack>
          </Flex>
          
          {/* Search Bar */}
          <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
              />
            </InputGroup>
            <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm" borderRadius="lg">Add Product</Button>
          </Flex>
          
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
              {filteredProducts.map(product => (
                <GridItem key={product.id}>
                  <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" overflow="hidden">
                    <CardHeader pb={3}>
                      <Flex justifyContent="space-between" alignItems="start">
                        <Box>
                          <Heading size="md" color="gray.800" mb={1}>{product.productID}</Heading>
                          <Text fontSize="sm" color="gray.500">Created: {new Date(product.createdAt).toLocaleDateString()}</Text>
                        </Box>
                        <HStack spacing={2}>
                          <Badge colorScheme={getStatusColor(product.currentStatus)} variant="solid" borderRadius="full" px={3} py={1}>
                            {product.currentStatus}
                          </Badge>
                          <Menu>
                            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                            <MenuList>
                              <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => confirmDelete(product.id)}>
                                Delete Product
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      <Box mb={4}>
                        <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">Recent Activity</Text>
                        <VStack align="stretch" spacing={1}>
                          {product.history?.slice(0, 3).map((event, index) => (
                            <Text key={index} fontSize="xs" color="gray.600" pl={2} borderLeft="2px" borderColor="gray.200">
                              {new Date(event.timestamp).toLocaleDateString()}: {event.status}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <VStack w="100%" spacing={2}>
                        <HStack w="100%" spacing={2}>
                          <Button size="sm" colorScheme="green" onClick={() => handleUpdateStatus(product.id, 'Like New')} leftIcon={<FiStar />} flex={1}>
                            Like New
                          </Button>
                          <Button size="sm" colorScheme="orange" onClick={() => handleUpdateStatus(product.id, 'Needs Refurbishment')} leftIcon={<FiRefreshCw />} flex={1}>
                            Refurbish
                          </Button>
                        </HStack>
                        <Button size="sm" colorScheme="red" onClick={() => handleUpdateStatus(product.id, 'Recycle')} leftIcon={<FiTrash2 />} w="100%" variant="outline">
                          Recycle
                        </Button>
                      </VStack>
                    </CardFooter>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={16} bg={cardBg} borderRadius="xl" border="2px dashed" borderColor="gray.300">
              <VStack spacing={4}>
                <Image src="/logo.png" alt="CircularChain Logo" h="100px" w="auto" maxW="250px" objectFit="contain" opacity={0.5} />
                <Heading size="lg" color="gray.600">
                  {searchQuery ? 'No products match your search' : 'No products returned yet'}
                </Heading>
                <Text color="gray.500">
                  {searchQuery ? 'Try adjusting your search terms' : 'Scan a product with the mobile app to see it here'}
                </Text>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery('')} colorScheme="blue" variant="outline">Clear Search</Button>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default App;