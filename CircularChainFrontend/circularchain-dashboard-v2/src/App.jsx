import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from './firebaseconfig'; // Changed from './firebaseConfig' to './firebaseconfig'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

// Import Chakra UI components
import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Box, Button, Container, Divider, Heading, HStack, Tag, Text, useToast, VStack, Spinner, Avatar
} from '@chakra-ui/react';

function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/returns');
      setProducts(response.data);
    } catch (error) { 
      console.error("Error fetching products:", error); 
    }
  };

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

  const handleSignIn = async () => { 
    try {
      await signInWithPopup(auth, new GoogleAuthProvider()); 
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignOut = async () => { 
    try {
      await signOut(auth); 
      setProducts([]);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleUpdateStatus = async (productId, newStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/returns/${productId}/status`, { newStatus });
      toast({ 
        title: "Status Updated", 
        status: "success", 
        duration: 2000, 
        isClosable: true 
      });
      fetchProducts();
    } catch (error) { 
      console.error("Update failed:", error);
      toast({ 
        title: "Update Failed", 
        status: "error", 
        duration: 2000, 
        isClosable: true 
      }); 
    }
  };

  const getTagColor = (status) => {
    if (status?.includes('Like New')) return 'green';
    if (status?.includes('Refurbishment')) return 'orange';
    if (status?.includes('Recycle')) return 'red';
    return 'gray';
  };

  if (loading) {
    return (
      <Container centerContent py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }
  
  if (!user) {
    return (
      <Container centerContent py={20}>
        <VStack spacing={4}>
          <Heading>Welcome to CircularChain</Heading>
          <Text>Please sign in to continue</Text>
          <Button colorScheme="blue" onClick={handleSignIn}>
            Sign in with Google
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justifyContent="space-between">
          <Box>
            <Heading as="h1" size="xl">CircularChain Dashboard</Heading>
            <Text color="gray.500">Welcome, {user.displayName}!</Text>
          </Box>
          <HStack>
            <Avatar size="sm" name={user.displayName} src={user.photoURL} />
            <Button size="sm" onClick={handleSignOut}>Sign Out</Button>
          </HStack>
        </HStack>
        
        <Divider />
        
        <Heading as="h2" size="lg">Product Inventory</Heading>
        
        {products.length > 0 ? (
          <Accordion allowToggle>
            {products.map(product => (
              <AccordionItem key={product.id}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="bold">Product ID: {product.productID}</Text>
                    </Box>
                    <Tag colorScheme={getTagColor(product.currentStatus)}>
                      {product.currentStatus}
                    </Tag>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    {/* History Section */}
                    <Box>
                      <Heading size="sm">History</Heading>
                      {product.history?.map((event, index) => (
                        <Text key={index} fontSize="sm" color="gray.600">
                          - {new Date(event.timestamp).toLocaleString()}: {event.status} (by {event.actor})
                        </Text>
                      ))}
                    </Box>
                    <Divider />
                    {/* Actions Section */}
                    <Box>
                       <Heading size="sm">Actions</Heading>
                       <HStack mt={2} spacing={2} flexWrap="wrap">
                          <Button size="sm" colorScheme="green" onClick={() => handleUpdateStatus(product.id, 'Like New')}>
                            Mark 'Like New'
                          </Button>
                          <Button size="sm" colorScheme="orange" onClick={() => handleUpdateStatus(product.id, 'Needs Refurbishment')}>
                            Mark for Refurbishment
                          </Button>
                          <Button size="sm" colorScheme="red" onClick={() => handleUpdateStatus(product.id, 'Recycle')}>
                            Mark for Recycling
                          </Button>
                       </HStack>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Box textAlign="center" py={8}>
            <Text fontSize="lg">No products returned yet.</Text>
            <Text color="gray.500">Scan a product with the mobile app to see it here.</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default App;