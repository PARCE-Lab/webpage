import numpy as np
import pytest

from submission import normalize, rotation_matrix


@pytest.mark.points(1)
def test_normalize_unit_length():
    """normalize returns a vector of length 1"""
    assert np.isclose(np.linalg.norm(normalize(np.array([3.0, 4.0]))), 1.0)


@pytest.mark.points(1)
def test_normalize_direction():
    """normalize keeps the direction"""
    assert np.allclose(normalize(np.array([3.0, 4.0])), [0.6, 0.8])


@pytest.mark.points(1)
def test_normalize_zero():
    """normalize leaves the zero vector unchanged"""
    assert np.allclose(normalize(np.zeros(3)), np.zeros(3))


@pytest.mark.points(1)
def test_rotation_shape():
    """rotation_matrix returns a 2x2 array"""
    assert np.shape(rotation_matrix(0.3)) == (2, 2)


@pytest.mark.points(2)
def test_rotation_quarter_turn():
    """rotating (1, 0) by 90° gives (0, 1)"""
    assert np.allclose(rotation_matrix(np.pi / 2) @ [1.0, 0.0], [0.0, 1.0])


@pytest.mark.points(2)
def test_rotation_is_orthonormal():
    """R^T R = I and det(R) = 1 for any angle"""
    for theta in np.linspace(-np.pi, np.pi, 7):
        R = rotation_matrix(theta)
        assert np.allclose(R.T @ R, np.eye(2))
        assert np.isclose(np.linalg.det(R), 1.0)
