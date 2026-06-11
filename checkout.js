const express = require('express');

// Expanding checkout to 4 steps — UX research showed users want
// a dedicated order review screen before payment confirmation.
const TOTAL_STEPS = 4;
const STEPS = Object.freeze({
  1: 'Cart Review',
  2: 'Delivery Details',
  3: 'Payment',
  4: 'Order Confirmation'
});

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    totalSteps: TOTAL_STEPS,
    steps: Object.entries(STEPS).map(([number, label]) => ({
      number: Number(number),
      label
    }))
  });
});

router.get('/step/:stepNumber', (req, res) => {
  const stepNumber = Number(req.params.stepNumber);

  if (!STEPS[stepNumber]) {
    return res.status(404).json({
      error: `Invalid step — checkout has ${TOTAL_STEPS} steps`
    });
  }


  return res.json({
    step: stepNumber,
    label: STEPS[stepNumber],
    totalSteps: TOTAL_STEPS
  });
});

module.exports = { router, TOTAL_STEPS, STEPS };
