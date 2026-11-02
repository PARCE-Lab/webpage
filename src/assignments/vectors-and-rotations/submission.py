import numpy as np


def normalize(v):
    """Return v scaled to unit length. Return v unchanged if its length is 0."""
    # TODO: your code here
    raise NotImplementedError


def rotation_matrix(theta):
    """Return the 2x2 matrix that rotates a vector counterclockwise by theta radians."""
    # TODO: your code here
    raise NotImplementedError


if __name__ == "__main__":
    print(normalize(np.array([3.0, 4.0])))                      # expect [0.6 0.8]
    print(rotation_matrix(np.pi / 2) @ np.array([1.0, 0.0]))    # expect about [0. 1.]
