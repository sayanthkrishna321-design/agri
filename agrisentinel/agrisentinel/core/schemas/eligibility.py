from pydantic import BaseModel, Field
from typing import Literal


class EligibilityResult(BaseModel):
    status: Literal[
        "INSUFFICIENT_INFO",
        "NOT_ELIGIBLE",
        "ELIGIBILITY_REQUIRES_SCHEME_CHECK",
    ]

    reasons: list[str] = Field(default_factory=list)