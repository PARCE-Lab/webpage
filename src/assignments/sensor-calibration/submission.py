import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def load_readings(path="sensors.csv"):
    """Return the readings in path as a DataFrame, without rows that have missing values."""
    # TODO: your code here
    raise NotImplementedError


def fit_calibration(df):
    """Return a LinearRegression fitted to predict temperature_c from voltage_v."""
    # TODO: your code here
    raise NotImplementedError


def predict_temperature(model, voltage):
    """Return the temperature (a float) that the model predicts for one voltage."""
    # TODO: your code here
    raise NotImplementedError


if __name__ == "__main__":
    df = load_readings()
    print(df.describe())

    model = fit_calibration(df)
    print(f"temperature = {model.coef_[0]:.2f} * voltage + {model.intercept_:.2f}")

    v = np.linspace(df["voltage_v"].min(), df["voltage_v"].max(), 50)
    plt.scatter(df["voltage_v"], df["temperature_c"], label="readings")
    plt.plot(v, model.predict(pd.DataFrame({"voltage_v": v})), color="orange", label="calibration")
    plt.xlabel("voltage (V)")
    plt.ylabel("temperature (°C)")
    plt.legend()
    plt.show()
