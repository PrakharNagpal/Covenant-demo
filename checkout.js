const express = require('express');

// Decision #3: checkout is exactly 3 steps: Cart -> Delivery -> Payment.
const TOTAL_STEPS = 3;
const STEPS = Object.freeze({
  1: 'Cart Review',
  2: 'Delivery Details',
  3: 'Payment'
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
      error: `Checkout has exactly ${TOTAL_STEPS} steps`
    });
  }

  return res.json({
    step: stepNumber,
    label: STEPS[stepNumber],
    totalSteps: TOTAL_STEPS
  });
});

module.exports = {
  router,
  TOTAL_STEPS,
  STEPS
};
