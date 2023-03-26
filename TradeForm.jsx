import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; // Import the neumorphism.css file

function TradeForm() {
  const [tradeType, setTradeType] = useState('dash-to-wHTH');
  const [inputAmount, setInputAmount] = useState(0);

  const handleTradeTypeChange = (event) => {
    setTradeType(event.target.value);
  };

  const handleInputChange = (event) => {
    setInputAmount(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.post(`http://localhost:7000/${tradeType}`, {
      inputAmount,
    });
    console.log(response.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Select trade type:
        <select value={tradeType} onChange={handleTradeTypeChange}>
          <option value="dash-to-wHTH">Dash to wHTH</option>
          <option value="wHTH-to-dash">wHTH to Dash</option>
        </select>
      </label>
      <br />
      <label>
        Input amount:
        <input type="number" value={inputAmount} onChange={handleInputChange} />
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
}

export default TradeForm;