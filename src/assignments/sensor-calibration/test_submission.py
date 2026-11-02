import pandas as pd
import pytest

from submission import fit_calibration, load_readings, predict_temperature


@pytest.fixture
def df():
    return load_readings("sensors.csv")


@pytest.mark.points(1)
def test_load_returns_dataframe(df):
    """load_readings returns a DataFrame with the three columns"""
    assert isinstance(df, pd.DataFrame)
    assert list(df.columns) == ["time_s", "voltage_v", "temperature_c"]


@pytest.mark.points(2)
def test_load_drops_missing(df):
    """load_readings drops the rows with missing values"""
    assert len(df) == 38
    assert not df.isna().any().any()


@pytest.mark.points(3)
def test_calibration_coefficients(df):
    """the fitted slope and intercept are close to the true calibration"""
    model = fit_calibration(df)
    assert model.coef_[0] == pytest.approx(12.5, abs=0.3)
    assert model.intercept_ == pytest.approx(5.0, abs=0.6)


@pytest.mark.points(2)
def test_predict_temperature(df):
    """predict_temperature returns a float close to the expected value"""
    value = predict_temperature(fit_calibration(df), 2.0)
    assert isinstance(value, float)
    assert value == pytest.approx(30.0, abs=0.6)
