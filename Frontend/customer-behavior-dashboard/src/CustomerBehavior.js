import React, { useState, useEffect } from 'react';

function CustomerBehavior() {
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    fetch('/api/customer-behavior')
      .then(res => res.json())
      .then(data => setCustomerData(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1>Customer Behavior Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Behavior Score</th>
            <th>Last Interaction</th>
          </tr>
        </thead>
        <tbody>
          {customerData.map(customer => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.behaviorScore}</td>
              <td>{customer.lastInteraction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerBehavior;
