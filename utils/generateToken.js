const jwt = require("jsonwebtoken");

//generate jw token
const generateToken = (id, tokenName, expiryTime) => {
  return jwt.sign({ id }, process.env[tokenName], {
    expiresIn: expiryTime,
  });
};

module.exports = generateToken;
