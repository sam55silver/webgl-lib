export const setUpUISlider = (label, range, value, callback) => {
  const ui = document.querySelector('#ui-container');

  const sliderDiv = document.createElement('div');

  const sliderLabel = document.createElement('label');
  sliderLabel.innerHTML = label;
  sliderDiv.appendChild(sliderLabel);

  const sliderInput = document.createElement('input');
  sliderInput.setAttribute('id', label);
  sliderInput.setAttribute('type', 'range');
  sliderInput.setAttribute('min', range[0]);
  sliderInput.setAttribute('max', range[1]);
  sliderInput.setAttribute('value', value);
  sliderDiv.appendChild(sliderInput);

  const sliderValue = document.createElement('span');
  sliderValue.innerHTML = sliderInput.value;
  sliderDiv.appendChild(sliderValue);

  sliderInput.addEventListener(
    'input',
    (e) => {
      const val = e.target.value;

      sliderValue.innerHTML = val;
      callback(Number(val));
    },
    false
  );

  ui.appendChild(sliderDiv);
};
