const rolesModel = require('../models/rolesModel');

const getAllRoles = (req, res, next) => {
  rolesModel.getRoles((error, results) => {
    if (error) return next(error);
    res.json(results);
  });
};

module.exports = { getAllRoles };