import pytest

try:
    from submission import my_function
except Exception as e:  # syntax error, missing function, etc.
    my_function = None
    IMPORT_ERROR = e


@pytest.fixture(autouse=True)
def require_function():
    if my_function is None:
        pytest.fail(f"Could not import my_function from submission.py: {IMPORT_ERROR}")


@pytest.mark.points(1)
@pytest.mark.parametrize(
    "a, b, expected",
    [
        (3, 2, 5),
        (5, 2, 7),
        (8, 10, 18),
        (-5, 7, 2),
        (0, 0, 0),
        (1.5, 2.5, 4.0),
    ],
)
def test_adds_two_numbers(a, b, expected):
    """my_function(a, b) should return a + b"""
    result = my_function(a, b)
    assert result == pytest.approx(expected), (
        f"my_function({a}, {b}) returned {result}, expected {expected}"
    )
