const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spin-button');
const optionsInput = document.getElementById('options-input');
const resultPopup = document.getElementById('result-popup');
const resultMessage = document.getElementById('result-message');
const selectedOptionText = document.getElementById('selected-option');
const closePopupButton = document.getElementById('close-popup');
const tickSound = document.getElementById('tick-sound');
const backgroundMusic = document.getElementById('background-music'); // Added background music
const popupSound = document.getElementById('popup-sound'); // Added popup sound

let options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']; // Default options
let startAngle = 0;
let spinning = false;

// Function to generate vibrant colors for each slice
function getSliceColor(index, total) {
  const hue = (index * 360) / total; // Distribute hues evenly
  return `hsl(${hue}, 70%, 60%)`; // Use HSL for vibrant colors
}

// Draw the wheel with options
function drawWheel() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const outerRadius = 180;
  const sliceAngle = (2 * Math.PI) / options.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  options.forEach((option, index) => {
    const startAngle = index * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.closePath();

    // Fill slice with vibrant color
    ctx.fillStyle = getSliceColor(index, options.length);
    ctx.fill();

    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff'; // White text for better contrast
    ctx.font = '14px Poppins, sans-serif';
    ctx.fillText(option, outerRadius - 10, 5);
    ctx.restore();
  });
}

// Play tick sound
function playTickSound() {
  tickSound.currentTime = 0; // Reset sound to start
  tickSound.play();
}

// Play popup sound
function playPopupSound() {
  popupSound.currentTime = 0;
  popupSound.play();
}

// Spin the wheel
function spinWheel() {
  if (spinning) return;
  spinning = true;

  let currentSpeed = 50; // Initial spin speed
  let deceleration = 0.985; // Deceleration rate
  let currentAngle = 0;
  let lastTickAngle = -1; // Track the last angle where the tick sound was played

  function animate() {
    if (currentSpeed > 0.1) {
      currentSpeed *= deceleration;
      currentAngle += currentSpeed * (Math.PI / 180);
      startAngle = currentAngle;
      drawRotatedWheel();

      // Calculate the current slice boundary angle
      const sliceAngle = (2 * Math.PI) / options.length;
      const adjustedAngle = (currentAngle + Math.PI / 2) % (2 * Math.PI); // Adjust for arrow position
      const currentSlice = Math.floor(adjustedAngle / sliceAngle);

      // Play tick sound when a new slice boundary hits the arrow
      if (currentSlice !== lastTickAngle) {
        playTickSound();
        lastTickAngle = currentSlice; // Update the last tick angle
      }

      requestAnimationFrame(animate);
    } else {
      spinning = false;
      stopWheel();
    }
  }

  requestAnimationFrame(animate);
}

// Draw the rotated wheel
function drawRotatedWheel() {
  ctx.save();
  ctx.translate(200, 200);
  ctx.rotate(startAngle);
  ctx.translate(-200, -200);
  drawWheel();
  ctx.restore();
}

// Stop the wheel and display the result
function stopWheel() {
  const sliceAngle = (2 * Math.PI) / options.length;
  const adjustedAngle = (startAngle + Math.PI / 2) % (2 * Math.PI); // Adjust for arrow position
  const selectedIndex = Math.floor((2 * Math.PI - adjustedAngle) / sliceAngle) % options.length;

  const selectedOption = options[selectedIndex] || "No option selected";
  selectedOptionText.textContent = selectedOption; // Update the selected option text
  resultPopup.style.display = 'flex'; // Show the popup

  playPopupSound(); // Play popup sound when the result is shown

  // Trigger confetti
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Event Listeners

// Spin button click
spinButton.addEventListener('click', () => {
  options = optionsInput.value.split(',').map(option => option.trim()).filter(Boolean);
  if (options.length < 2) {
    options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']; // Default options
  }
  drawWheel();
  spinWheel();
});

// Close popup button
closePopupButton.addEventListener('click', () => {
  resultPopup.style.display = 'none';
});

// Close popup when clicking outside
resultPopup.addEventListener('click', (e) => {
  if (e.target === resultPopup) {
    resultPopup.style.display = 'none';
  }
});

// Initial draw
drawWheel();