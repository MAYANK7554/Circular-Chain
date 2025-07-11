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

console.log("Backend started with email-based ownership transfer.");

// --- API ENDPOINTS ---

app.get('/api/returns', (req, res) => {
  res.json([...returnedProducts].reverse());
});

app.post('/api/returns', async (req, res) => {
  const { productID } = req.body;
  if (!productID) {
    return res.status(400).json({ error: 'productID is required' });
  }
  
  const newProduct = {
    id: nextProductId++,
    productID: productID,
    owner: "Walmart",
    history: [
      {
        status: "Returned - Pending Inspection",
        timestamp: new Date().toISOString(),
        actor: "Mobile App User"
      }
    ],
    currentStatus: "Returned - Pending Inspection",
    txHash: `0x_simulated_hash_${Date.now()}`
  };
  returnedProducts.push(newProduct);
  console.log(`Product ${productID} created.`);
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

// --- NEW OWNERSHIP TRANSFER ENDPOINT ---
app.post('/api/returns/:id/transfer', async (req, res) => {
    const { id } = req.params;
    const { newOwnerEmail } = req.body; // Expecting an email address

    if (!newOwnerEmail) {
      return res.status(400).json({ error: 'newOwnerEmail is required' });
    }

    const productIndex = returnedProducts.findIndex(p => p.id == id);
    if (productIndex !== -1) {
      const product = returnedProducts[productIndex];
      const previousOwner = product.owner;
      product.owner = newOwnerEmail; // Update the owner to the new email
      
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


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
