const express = require('express');
require('dotenv/config');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- DATA STORE ---
let returnedProducts = [];
let nextProductId = 1;
let buyingInquiries = []; // Added data store for buying inquiries

console.log("Backend started with email-based ownership transfer.");

// --- API ENDPOINTS ---

app.get('/api/returns', (req, res) => {
  res.json([...returnedProducts].reverse());
});

app.post('/api/returns', async (req, res) => {
  console.log('Received POST request:', req.body);
  const { productID, scannedBy } = req.body;
  
  if (!productID) {
    return res.status(400).json({ error: 'productID is required' });
  }
  
  const currentTime = new Date().toISOString();
  
  const newProduct = {
    id: nextProductId++,
    productID: productID,
    owner: scannedBy ? scannedBy.toLowerCase() : null, // Set owner to the person who scanned
    scannedBy: scannedBy ? scannedBy.toLowerCase() : null,
    createdAt: currentTime,
    history: [
      {
        status: "Returned - Pending Inspection",
        timestamp: currentTime,
        actor: "Mobile App Scan"
      }
    ],
    currentStatus: "Returned - Pending Inspection",
    txHash: `0x_simulated_hash_${Date.now()}`
  };
  
  returnedProducts.push(newProduct);
  
  console.log('Created product:', JSON.stringify(newProduct, null, 2));
  console.log(`Product ${productID} created with ID ${newProduct.id} owned by ${scannedBy} at ${currentTime}`);
  
  res.status(201).json(newProduct);
});

app.put('/api/returns/:id/status', async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  if (!newStatus) return res.status(400).json({ error: 'newStatus is required' });

  const productIndex = returnedProducts.findIndex(p => p.id == id);
  if (productIndex !== -1) {
    const product = returnedProducts[productIndex];
    product.history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor: "Dashboard User"
    });
    product.currentStatus = newStatus;
    console.log(`Product ${id} status updated to: ${newStatus}`);
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// --- OWNERSHIP TRANSFER ENDPOINT ---
app.post('/api/returns/:id/transfer', async (req, res) => {
    const { id } = req.params;
    const { newOwnerEmail } = req.body;

    if (!newOwnerEmail) {
      return res.status(400).json({ error: 'newOwnerEmail is required' });
    }

    const productIndex = returnedProducts.findIndex(p => p.id == id);
    if (productIndex !== -1) {
      const product = returnedProducts[productIndex];
      const previousOwner = product.owner;
      product.owner = newOwnerEmail;
      
      product.history.push({
        status: `Transferred to ${newOwnerEmail}`,
        timestamp: new Date().toISOString(),
        actor: previousOwner 
      });
      product.currentStatus = "Transferred to Partner";
      
      console.log(`Product ${id} transferred from ${previousOwner} to: ${newOwnerEmail}`);
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
});

app.delete('/api/returns/:id', async (req, res) => {
  const { id } = req.params;
  const productIndex = returnedProducts.findIndex(p => p.id == id);
  
  if (productIndex !== -1) {
    const deletedProduct = returnedProducts.splice(productIndex, 1)[0];
    console.log(`Product ${id} deleted`);
    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// --- BUYING INQUIRIES ENDPOINT ---
app.post('/api/buying-inquiries', (req, res) => {
  const inquiry = {
    ...req.body,
    id: Date.now().toString(), // or use uuid
  };
  // Save inquiry to your data store (e.g. array, database)
  buyingInquiries.push(inquiry); // If using an array
  res.status(201).json(inquiry);
});

app.put('/api/buying-inquiries/:id', (req, res) => {
  const { id } = req.params;
  const { status, response, respondedAt } = req.body;
  // Find the inquiry by id and update its status/response
  const inquiry = buyingInquiries.find(i => i.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  inquiry.status = status;
  inquiry.response = response;
  inquiry.respondedAt = respondedAt;
  res.json(inquiry);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Server also accessible at http://192.168.1.6:${port}`);
});
