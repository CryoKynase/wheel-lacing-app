from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class PatternRequest(BaseModel):
    holes: int = Field(..., description="Total rim holes, even and >= 20")
    wheelType: Literal["rear", "front"]
    crosses: int
    symmetry: Literal["symmetrical", "asymmetrical"]
    invertHeads: bool
    startRimHole: int
    valveReference: Literal["right_of_valve", "left_of_valve"]
    startHubHoleDS: int
    startHubHoleNDS: int

    @field_validator("holes")
    @classmethod
    def validate_holes(cls, value: int) -> int:
        if value < 20 or value % 2 != 0:
            raise ValueError("holes must be even and >= 20")
        return value

    @field_validator("crosses")
    @classmethod
    def validate_crosses(cls, value: int) -> int:
        if value < 0:
            raise ValueError("crosses must be >= 0")
        return value

    @field_validator("startRimHole")
    @classmethod
    def validate_start_rim_hole(cls, value: int, info) -> int:
        holes = info.data.get("holes")
        if holes is None:
            return value
        if value < 1 or value > holes:
            raise ValueError("startRimHole must be within 1..holes")
        return value

    @field_validator("startHubHoleDS", "startHubHoleNDS")
    @classmethod
    def validate_start_hub_hole(cls, value: int, info) -> int:
        holes = info.data.get("holes")
        if holes is None:
            return value
        half = holes // 2
        if value < 1 or value > half:
            raise ValueError("startHubHole must be within 1..holes/2")
        return value


class PatternRow(BaseModel):
    spoke: str
    order: int
    step: str
    side: Literal["DS", "NDS"]
    oddEvenSet: Literal["Odd", "Even"]
    k: int
    hubHole: int
    heads: Literal["IN", "OUT"]
    rimHole: int
    crossesDescribed: str
    notes: str


class PatternResponse(BaseModel):
    params: PatternRequest
    derived: dict
    rows: list[PatternRow]
