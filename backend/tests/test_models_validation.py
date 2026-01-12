import pytest
from pydantic import ValidationError

from app.models import PatternRequest


def base_payload() -> dict:
    return {
        "holes": 32,
        "wheelType": "rear",
        "crosses": 3,
        "symmetry": "symmetrical",
        "invertHeads": False,
        "startRimHole": 1,
        "valveReference": "right_of_valve",
        "startHubHoleDS": 1,
        "startHubHoleNDS": 1,
    }


def test_request_validation_invalid_holes() -> None:
    payload = base_payload()
    payload["holes"] = 31
    with pytest.raises(ValidationError):
        PatternRequest(**payload)


def test_request_validation_invalid_start_rim_hole() -> None:
    payload = base_payload()
    payload["startRimHole"] = 40
    with pytest.raises(ValidationError):
        PatternRequest(**payload)


def test_request_validation_invalid_start_hub_hole() -> None:
    payload = base_payload()
    payload["startHubHoleDS"] = 20
    with pytest.raises(ValidationError):
        PatternRequest(**payload)
