import pytest

from app.compute.validation import common_crosses, derive_H, validate_crosses


def test_derive_h() -> None:
    assert derive_H(32) == 16


def test_validate_crosses_boundaries_32h() -> None:
    validate_crosses(32, 7)
    with pytest.raises(ValueError):
        validate_crosses(32, 8)


def test_validate_crosses_boundaries_24h() -> None:
    validate_crosses(24, 5)
    with pytest.raises(ValueError):
        validate_crosses(24, 6)


def test_common_crosses_32h() -> None:
    assert common_crosses(32) == [0, 1, 2, 3, 4]


def test_common_crosses_20h() -> None:
    assert common_crosses(20) == [0, 1, 2]
