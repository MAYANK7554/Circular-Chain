import React, { useState } from 'react';
import axios from 'axios';

// This component receives a function 'onMintSuccess' from its parent
function MintForm({ onMintSuccess }) {
  // A state to hold the value of the input field
  const [productID, setProductID] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the browser from refreshing
    if (!productID) {
      alert('Please enter a Product ID.');
      return;
    }
    setIsLoading(true); // Disable the button while processing

    try {
      // Send the productID to our backend API
      const response = await axios.post('http://localhost:3001/api/returns', { productID });

      console.log('Minting successful:', response.data.txHash);
      alert(`Passport minted successfully! TxHash: ${response.data.txHash}`);

      setProductID(''); // Clear the input field
      onMintSuccess();  // Tell the parent component to refresh the list

    } catch (error) {
      console.error('Error minting passport:', error);
      alert('Failed to mint passport.');
    } finally {
      setIsLoading(false); // Re-enable the button
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h3>Mint a New Product Passport</h3>
      <input
        type="text"
        value={productID}
        onChange={(e) => setProductID(e.target.value)}
        placeholder="Enter Product ID (e.g., WM-12345)"
        style={{ padding: '8px', marginRight: '8px', minWidth: '300px' }}
      />
      <button type="submit" disabled={isLoading} style={{ padding: '8px 12px' }}>
        {isLoading ? 'Minting...' : 'Mint Passport'}
      </button>
    </form>
  );
}

export default MintForm;