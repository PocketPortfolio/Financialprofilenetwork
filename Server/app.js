const express = require('express');
const app = express();
const port = 8081;

// Import necessary modules and classes from Python code
const { PythonShell } = require('python-shell');

app.get('/api/customer-behavior', (req, res) => {
  // Create a new Python shell instance and run the Python code
  let options = {
    mode: 'json', // Change the mode to 'json' to automatically parse JSON output
    pythonPath: '/home/ec2-user/miniconda3/bin/python3',
    scriptPath: '/home/ec2-user/Financialprofilenetwork/',
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
  console.log(`Server running at http://54.196.160.42:${port}`);
});
