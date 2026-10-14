const express = require('express');
const router = express.Router();
const { getRoleRequirements, getDynamicRoleRequirements, getAllCompanies } = require('../services/role.service');

// Get role requirements for specific company and role (supports custom and predefined)
router.get('/role-requirements', async (req, res) => {
  try {
    const { companyId, role, jobDescription } = req.query;
    
    if (!companyId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company ID and role are required'
      });
    }

    const requirements = await getDynamicRoleRequirements(companyId, role, jobDescription);

    res.json({
      success: true,
      data: {
        company: companyId,
        role: role,
        requirements: requirements
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error generating role requirements',
      error: error.message
    });
  }
});

// Dynamic role requirements generation via POST (allows pasting longer job descriptions)
router.post('/role-requirements', async (req, res) => {
  try {
    const { company, role, jobDescription } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company and role are required'
      });
    }

    const requirements = await getDynamicRoleRequirements(company, role, jobDescription);

    res.json({
      success: true,
      data: {
        company,
        role,
        requirements
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error generating role requirements',
      error: error.message
    });
  }
});

// Get all companies and their available roles
router.get('/companies', (req, res) => {
  try {
    const companies = getAllCompanies();
    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching companies',
      error: error.message
    });
  }
});

module.exports = router;
