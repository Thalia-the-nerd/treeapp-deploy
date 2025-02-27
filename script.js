async function processDonation(amount) {
  const response = await fetch('https://your-worker-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: paymentToken })
  })
  const { success } = await response.json()
  if (success) {
    alert('Payment successful!');
  } else {
    alert('Payment failed. Please try again.');
  }
}