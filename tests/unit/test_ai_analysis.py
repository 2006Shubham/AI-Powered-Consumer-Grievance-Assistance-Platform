import pytest
from backend.ai.schemas import CaseAnalysis, FollowUpQuestions, UserAnswersInput
from backend.ai.prompts import build_case_analysis_user_prompt, build_follow_up_user_prompt

def test_case_analysis_schema_validation():
    data = {
        "summary": "Customer purchased a laptop that stops working after 2 days.",
        "category": "electronics",
        "issue_type": "defective_product",
        "desired_resolution": "replacement",
        "key_facts": ["Laptop purchased 2 days ago", "Screen flickers and dies"],
        "missing_information": ["purchase_date", "seller_name"]
    }
    analysis = CaseAnalysis(**data)
    assert analysis.category == "electronics"
    assert analysis.issue_type == "defective_product"
    assert len(analysis.key_facts) == 2

def test_follow_up_questions_schema_validation():
    data = {
        "questions": [
            "When did you purchase the item?",
            "Do you have an invoice?",
            "What is the seller's name?"
        ]
    }
    follow_ups = FollowUpQuestions(**data)
    assert len(follow_ups.questions) == 3

def test_user_answers_input_schema():
    answers = {
        "purchase_date": "2026-07-20",
        "seller_name": "Tech Corp"
    }
    input_model = UserAnswersInput(answers=answers)
    assert input_model.answers["seller_name"] == "Tech Corp"

def test_prompt_builders():
    prompt = build_case_analysis_user_prompt("TV Screen Issue", "My smart TV screen turned black.")
    assert "TV Screen Issue" in prompt
    assert "My smart TV screen turned black." in prompt

    follow_up_prompt = build_follow_up_user_prompt("TV issue", ["purchase_date"])
    assert "purchase_date" in follow_up_prompt
