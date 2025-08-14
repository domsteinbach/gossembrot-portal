const bcrypt = require('bcrypt');

const register = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Registration Hash:', hashedPassword);
  return hashedPassword; // Return the hashed password
};

// Check if a password was provided in the command line arguments
if (process.argv.length < 3) {
  console.log('Usage: node registerUser.js [password]');
  process.exit(1);
}

// Get the password from command line arguments
const password = process.argv[2];

// Call the register function with the provided password
register(password);
