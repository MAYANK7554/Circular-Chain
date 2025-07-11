import React, { useState, useEffect } from 'react';
import axios from 'axios';

// The new, explicit import block
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Tag,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';


function App() {
  const [products, setProducts] = useState([]);
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
    fetchProducts();
    const intervalId = setInterval(fetchProducts, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUpdateStatus = async (productId, newStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/returns/${productId}/status`, { newStatus });
      toast({ title: "Status Updated", status: "success", duration: 2000, isClosable: true });
      fetchProducts();
    } catch (error) {
      toast({ title: "Update Failed", status: "error", duration: 2000, isClosable: true });
    }
  };

  const getTagColor = (status) => {
    if (status.includes('Like New')) return 'green';
    if (status.includes('Refurbishment')) return 'orange';
    if (status.includes('Recycle')) return 'red';
    if (status.includes('Transferred')) return 'blue';
    return 'gray';
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl">CircularChain Dashboard</Heading>
          <Text color="gray.500">The central hub for managing returned assets.</Text>
        </Box>

        <Divider />

        <Heading as="h2" size="lg">Returned Products Inventory</Heading>

        {products.length > 0 ? (
          <Accordion allowToggle>
            {products.map(product => (
              <AccordionItem key={product.id}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="bold">Product ID: {product.productID}</Text>
                    </Box>
                    <Tag colorScheme={getTagColor(product.currentStatus)}>{product.currentStatus}</Tag>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Heading size="sm">History</Heading>
                      {product.history.map((event, index) => (
                        <Text key={index} fontSize="sm" color="gray.600">
                          - {new Date(event.timestamp).toLocaleString()}: {event.status} (by {event.actor})
                        </Text>
                      ))}
                    </Box>
                    <Divider />
                    <Box>
                       <Heading size="sm">Actions</Heading>
                       <HStack mt={2}>
                          <Button size="sm" colorScheme="green" onClick={() => handleUpdateStatus(product.id, 'Like New')}>Mark as 'Like New'</Button>
                          <Button size="sm" colorScheme="orange" onClick={() => handleUpdateStatus(product.id, 'Needs Refurbishment')}>Mark for Refurbishment</Button>
                          <Button size="sm" colorScheme="red" onClick={() => handleUpdateStatus(product.id, 'Recycle')}>Mark for Recycling</Button>
                       </HStack>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Text>No products returned yet.</Text>
        )}
      </VStack>
    </Container>
  );
}

export default App;