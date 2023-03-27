const express = require('express');
const app = express();
const port = 8081;

// Import necessary modules and classes from Python code
const { PythonShell } = require('python-shell');

app.get('/api/customer-behavior', (req, res) => {
  // Create a new Python shell instance and run the Python code
  let options = {
    mode: 'json', // Change the mode to 'json' to automatically parse JSON output
    pythonPath: '/Users/abbalawal/Documents/NNPC1/myenv/bin/python3',
    scriptPath: '/Users/abbalawal/Documents/NNPC1/myenv/Financialprofilenetwork/',
  };
  PythonShell.run('NNPC.py', options, function (err, results) {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred while running the Python script');
    }

    // Parse the predicted customer data from the Python output
    const customerData = results[0];
    console.log('customerData:', customerData);

    // Send the predicted customer data to the frontend as JSON
    res.json(customerData);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
