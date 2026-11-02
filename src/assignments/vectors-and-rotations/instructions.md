Complete the two functions in `submission.py`.

## 1. `normalize(v)`

Return `v` scaled to length 1. If `v` has length 0, return it unchanged instead of dividing by zero.

## 2. `rotation_matrix(theta)`

Return the 2×2 NumPy array that rotates a vector counterclockwise by `theta` radians:

```
[[cos θ, -sin θ],
 [sin θ,  cos θ]]
```

## Tips

- **Run code** executes your file, including the `if __name__ == "__main__":` block at the bottom. Use it to try things out.
- **Run tests** checks your functions and shows your score.
- Compare floats with `np.isclose` or `np.allclose`, not `==`.
