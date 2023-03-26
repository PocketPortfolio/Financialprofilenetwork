const express = require('express');
const app = express();
const port = 8081;

// Import necessary modules and classes from Python code
const { PythonShell } = require('python-shell');

app.get('/api/customer-behavior', (req, res) => {
  // Create a new Python shell instance and run the Python code
  let options = {
    mode: 'text',
    pythonPath: '/Users/abbalawal/Documents/NNPC1/myenv/bin/python3',
    scriptPath: '/Users/abbalawal/Documents/NNPC1/myenv/Financialprofilenetwork/',
  };
  PythonShell.run('NNPC.py', options, function (err, results) {
    if (err) throw err;
    console.log('results: %j', results);

    // Parse the predicted customer data from the Python output
    const customerData = JSON.parse(results[0]);

    // Send the predicted customer data to the frontend as JSON
    res.json(customerData);
  });
});

app.listen(8081, function() {
  console.log("Server running at http://localhost:8081");
});

