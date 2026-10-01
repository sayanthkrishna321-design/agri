from datetime import date


def check_insurance_eligibility(
    crop_name,
    planting_date,
    expected_harvest_date,
    damage_description,
):
    reasons = []

    if not crop_name:
        reasons.append("Crop name is missing.")

    if not planting_date:
        reasons.append("Planting date is missing.")

    if not expected_harvest_date:
        reasons.append("Expected harvest date is missing.")

    if not damage_description:
        reasons.append("Damage description is missing.")

    if reasons:
        return {
            "status": "INSUFFICIENT_INFO",
            "reasons": reasons,
        }

    if expected_harvest_date <= planting_date:
        return {
            "status": "NOT_ELIGIBLE",
            "reasons": [
                "Expected harvest date must be after planting date."
            ],
        }

    return {
        "status": "ELIGIBILITY_REQUIRES_SCHEME_CHECK",
        "reasons": [
            "Basic farm and crop information is complete.",
            "Final eligibility must be checked against the applicable insurance scheme rules.",
        ],
    }