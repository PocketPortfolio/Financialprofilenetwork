import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class CustomerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: []
    };
  }

  componentDidMount() {
    fetch('http://44.212.63.66:8081/api/customer-behavior')
      .then(response => response.json())
      .then(data => this.setState({ customers: data }))
      .catch(error => console.error(error));
  }

  render() {
    const { customers } = this.state;

    return (
      <div>
        <h1>Customer List</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Future Transaction</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.futureTransaction}</td>
                <td>{customer.behavior}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Change Over Time</h2>
        <LineChart width={800} height={400} data={customers}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Excellent" stroke="#8884d8" />
          <Line type="monotone" dataKey="Low Risk" stroke="#82ca9d" />
          <Line type="monotone" dataKey="High Risk" stroke="#ffc658" />
        </LineChart>
      </div>
    );
  }
}

export default CustomerList;
