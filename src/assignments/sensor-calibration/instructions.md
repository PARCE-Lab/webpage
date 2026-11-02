A temperature sensor outputs a voltage. `sensors.csv` holds 40 readings taken next to a reference thermometer, with columns `time_s`, `voltage_v`, and `temperature_c`. A few temperature readings are missing.

## 1. `load_readings(path)`

Read the CSV with pandas and return a `DataFrame` **without** the rows that have missing values.

## 2. `fit_calibration(df)`

Fit a scikit-learn `LinearRegression` that predicts `temperature_c` from `voltage_v`, and return the fitted model.

## 3. `predict_temperature(model, voltage)`

Return the predicted temperature for one voltage as a plain Python `float`.

**Run code** also draws the data and your calibration line, so you can see the fit.

Hint: scikit-learn expects a 2-D input, so use `df[["voltage_v"]]` (a table), not `df["voltage_v"]`.
